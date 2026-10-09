// WALLET + RECHARGE - SOT TOK
<div className="p-4 bg-black min-h-screen">
  <div className="rounded-2xl p-4 text-black" style={{background:"linear-gradient(90deg,#ff7a00,#facc15)"}}>
    <p className="text-sm opacity-80">My Coins</p>
    <p className="text-3xl font-bold">{myCoins} 🪙</p>
  </div>
  <div className="grid grid-cols-2 gap-3 mt-4">
    {[50,100,200,500,1000,5000].map(c=>(
      <button key={c} onClick={()=>recharge(c)} className="bg-white/10 border border-[#facc15]/30 rounded-xl p-3 text-white">
        <p className="font-bold">{c} Coins</p>
        <p className="text-xs text-[#facc15]">₹{c/100}</p>
      </button>
    ))}
  </div>
</div>