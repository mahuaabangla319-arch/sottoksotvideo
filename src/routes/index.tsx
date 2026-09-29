import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/feed");
  }, []);
  return <div className="bg-black text-white h-screen flex items-center justify-center">Loading SOT TOK...</div>;
}