import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";

function ForYouAllUsers(){
  const [wallet, setWallet] = useState({main:2500, coins:1250, diamonds:340});
  const [showRecharge, setShowRecharge] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [amount, setAmount] = useState(10);
  const [method, setMethod] = useState("");
  const [pin, setPin] = useState("");

  useEffect(()=>{
    const saved = localStorage.getItem("st_user_wallet");
    if(saved){ setWallet(JSON.parse(saved)); }
  },[]);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="flex justify-center gap-12 py-4">
        <span className="text-zinc-500">Following</span>
        <span className="font-bold border-b-2">For You</span>
      </div>
      <p className="text-right text-xs text-zinc-400 px-4">Tap for sound</p>

      <div className="flex px-4 mt-4">
        <img src="https://i.pravatar.cc/100?img=12" className="w-16 h-16 rounded-full border-2 border-white" />
        <div className="ml-4">
          <button className="bg-purple-600 px-6 py-2 rounded-lg font-bold text-sm">+ Follow</button>
          <p className="text-sm mt-1">SOT TOK ID: 96216703</p>
          <p className="text-xs text-zinc-400">@mahatohimanshu755</p>
        </div>
      </div>

      <div className="mx-3 mt-6 bg-zinc-900 rounded-2xl p-4">
        <p className="font-bold">Wallet</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span>Main Wallet</span><b>Rs {wallet.main}</b></div>
          <div className="flex justify-between"><span>Coins</span><b>{wallet.coins}</b></div>
          <div className="flex justify-between"><span>Diamonds</span><b>{wallet.diamonds}</b></div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="flex-1 border border-purple-600 py-2 rounded-full text-xs">Withdraw Diamonds</button>
          <button onClick={()=>setShowRecharge(true)} className="flex-1 bg-purple-600 py-2 rounded-full text-xs">Recharge +</button>
        </div>
        <p className="text-xs text-center mt-2 text-zinc-400">100 Diamonds = Rs 80</p>
      </div>

      <div className="mx-2 mt-4 bg-zinc-900 rounded-t-3xl p-4">
        <p className="text-center font-bold">Gift Pathan</p>
        <div className="grid grid-cols-5 gap-2 mt-4 text-[10px]">
          <button className="bg-zinc-800 p-2 rounded-xl">Free 0</button>
          <button className="bg-zinc-800 p-2 rounded-xl">Rose 10</button>
          <button className="bg-zinc-800 p-2 rounded-xl">Heart 50</button>
          <button className="bg-zinc-800 p-2 rounded-xl">Crown 100</button>
          <button className="bg-zinc-800 p-2 rounded-xl">Elephant 500</button>
          <button className="bg-zinc-800 p-2 rounded-xl">Diamond 1000</button>
          <button className="bg-zinc-800 p-2 rounded-xl">Car 5000</button>
          <button className="bg-zinc-800 p-2 rounded-xl">Trophy 10000</button>
          <button className="bg-zinc-800 p-2 rounded-xl">Lion 2000</button>
          <button className="bg-zinc-800 p-2 rounded-xl">Rocket 3000</button>
        </div>
      </div>

      {showRecharge && (
        <div className="fixed inset-0 bg-black/90 z-50 p-4">
          <div className="bg-zinc-900 rounded