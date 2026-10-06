import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";

function ForYouAllUsers(){
  const [wallet, setWallet] = useState({main2500, coins:1250, diamonds:340});
  const [showRecharge, setShowRecharge] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [amount, setAmount] = useState(10);
  const [method, setMethod] = useState("");
  const [pin, setPin] = useState("");

  const gifts = [
    {name:"Free", icon:"✨", coins:0},
    {name:"Rose", icon:"🌹", coins:10},
    {name:"Heart", icon:"💖", coins:50},
    {name:"Crown", icon:"👑", coins:100},
    {name:"Elephant", icon:"🐘", coins:500},
    {name:"Diamond", icon:"💎", coins:1000},
    {name:"Car", icon:"🚗", coins:5000},
    {name:"Super Trophy", icon:"🏆", coins:10000},
    {name:"Lion", icon:"🦁", coins:2000},
    {name:"Rocket", icon:"🚀", coins:3000},
  ];

  useEffect(()=>{
    const w = JSON.parse(localStorage.getItem("st_user_wallet")||'{"main":2500,"coins":1250,"diamonds":340}');
    setWallet(w);
  },[]);

  const handleGift = (g:any) => {
    if(wallet.coins < g.coins){ alert(`❌ Coins কম! ${g