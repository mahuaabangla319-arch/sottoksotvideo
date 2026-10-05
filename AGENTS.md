<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep video composition in browser media APIs and store finished clips in the existing video storage; edge server functions cannot access camera/canvas APIs.
- Reuse public videos' original audio as the selectable sound catalog; do not fabricate licensed music tracks or stream third-party music.
- Use one browser canvas effects renderer for camera preview and recorded output, with on-device face landmarks and CDN-backed WASM to avoid mismatched makeup or oversized repository files.
- Save creator-selected video categories for feed filtering; do not infer gender or attractiveness from images.
- Compute daily creator rankings server-side over visible public videos since midnight in India, without adding wallet rewards.
- Store song object paths rather than long-lived signed links; authorize visible library files plus owner/admin access before issuing short-lived playback URLs.

- Resolve feed creator avatars from profile avatar paths and use stored verification or follower eligibility for badges; never use placeholder portraits or infer identity from images.
