import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { RTC_CONFIG } from "@/lib/rooms";

type Signal =
  | { type: "offer" | "answer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; to: string; candidate: RTCIceCandidateInit };

/**
 * Mesh WebRTC voice. Signaling goes over the room's realtime broadcast channel.
 * A peer connection exists between every online pair where at least one side is on a seat.
 */
export function useVoiceMesh(opts: {
  channel: RealtimeChannel | null;
  me: string | null;
  online: string[];
  seated: string[];
  muted: boolean;
}) {
  const { channel, me, online, seated, muted } = opts;
  const amSeated = !!me && seated.includes(me);
  const [micError, setMicError] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const local = useRef<MediaStream | null>(null);
  const pcs = useRef(new Map<string, RTCPeerConnection>());
  const audios = useRef(new Map<string, HTMLAudioElement>());

  const send = (s: Signal) => channel?.send({ type: "broadcast", event: "rtc", payload: s });

  const closePeer = (id: string) => {
    pcs.current.get(id)?.close();
    pcs.current.delete(id);
    audios.current.get(id)?.remove();
    audios.current.delete(id);
    setConnected((c) => c.filter((x) => x !== id));
  };

  const makePeer = (peer: string) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pc.onicecandidate = (e) => {
      if (e.candidate && me) send({ type: "ice", from: me, to: peer, candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      let el = audios.current.get(peer);
      if (!el) {
        el = document.createElement("audio");
        el.autoplay = true;
        document.body.appendChild(el);
        audios.current.set(peer, el);
      }
      el.srcObject = e.streams[0] ?? new MediaStream([e.track]);
      void el.play().catch(() => {});
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setConnected((c) => [...new Set([...c, peer])]);
      if (pc.connectionState === "failed" || pc.connectionState === "closed") closePeer(peer);
    };
    pcs.current.set(peer, pc);
    return pc;
  };

  // Acquire / release the microphone with the seat.
  useEffect(() => {
    let cancelled = false;
    if (amSeated && !local.current) {
      navigator.mediaDevices
        ?.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
        .then((s) => {
          if (cancelled) return s.getTracks().forEach((t) => t.stop());
          s.getAudioTracks().forEach((t) => (t.enabled = !muted));
          local.current = s;
          setMicError(null);
          // rebuild links so the new track is sent
          [...pcs.current.keys()].forEach(closePeer);
        })
        .catch(() => setMicError("মাইক্রোফোনের অনুমতি দিন"));
    }
    if (!amSeated && local.current) {
      local.current.getTracks().forEach((t) => t.stop());
      local.current = null;
      [...pcs.current.keys()].forEach(closePeer);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amSeated]);

  useEffect(() => {
    local.current?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }, [muted]);

  // Signal handling
  useEffect(() => {
    if (!channel || !me) return;
    const handler = async ({ payload }: { payload: Signal }) => {
      if (payload.to !== me) return;
      const peer = payload.from;
      try {
        if (payload.type === "offer") {
          closePeer(peer);
          const pc = makePeer(peer);
          await pc.setRemoteDescription(payload.sdp);
          const track = local.current?.getAudioTracks()[0];
          for (const t of pc.getTransceivers()) {
            if (track) {
              t.direction = "sendrecv";
              await t.sender.replaceTrack(track);
            } else t.direction = "recvonly";
          }
          const ans = await pc.createAnswer();
          await pc.setLocalDescription(ans);
          send({ type: "answer", from: me, to: peer, sdp: ans });
        } else if (payload.type === "answer") {
          await pcs.current.get(peer)?.setRemoteDescription(payload.sdp);
        } else if (payload.type === "ice") {
          await pcs.current.get(peer)?.addIceCandidate(payload.candidate).catch(() => {});
        }
      } catch (err) {
        console.warn("rtc signal error", err);
      }
    };
    channel.on("broadcast", { event: "rtc" }, handler as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, me]);

  // Maintain peer set
  const wantKey = online.slice().sort().join(",") + "|" + seated.slice().sort().join(",") + "|" + String(!!local.current);
  useEffect(() => {
    if (!channel || !me) return;
    if (amSeated && !local.current) return; // wait for mic
    const want = online.filter((u) => u !== me && (amSeated || seated.includes(u)));
    for (const id of [...pcs.current.keys()]) if (!want.includes(id)) closePeer(id);
    for (const peer of want) {
      if (pcs.current.has(peer) || me > peer) continue; // lower id initiates
      const pc = makePeer(peer);
      const track = local.current?.getAudioTracks()[0];
      if (track && local.current) pc.addTrack(track, local.current);
      else pc.addTransceiver("audio", { direction: "recvonly" });
      void pc
        .createOffer()
        .then(async (o) => {
          await pc.setLocalDescription(o);
          send({ type: "offer", from: me, to: peer, sdp: o });
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wantKey, channel, me, amSeated]);

  useEffect(
    () => () => {
      [...pcs.current.keys()].forEach(closePeer);
      local.current?.getTracks().forEach((t) => t.stop());
      local.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { micError, connected };
}
