// src/app/login/page.tsx
"use client"

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation"; // 導入 router

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false); // 切換註冊/登入
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading 狀態
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // 開始 loading
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("註冊成功！請登入");
        setIsRegister(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("登入成功！");
        router.push("/accounting"); // 登入成功導入記帳頁面
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "未知錯誤");
    } finally {
      setLoading(false); // 結束 loading
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-yellow-100">
      <h1 className="text-2xl font-bold mb-4 text-gray-500">{isRegister ? "註冊帳號" : "登入帳號"}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="密碼"
          className="w-full border p-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* 按鈕與 loading 狀態切換 */}
        <button type="submit" 
          className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-400 cursor-pointer flex items-center justify-center"
          disabled={loading}
        >
          {loading? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            isRegister ? "註冊" : "登入"
          )}
        </button>
        <p className="text-sm mt-4 text-center cursor-pointer text-blue-600" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "已有帳號？點此登入" : "沒有帳號？點此註冊"}
        </p>
        <p className={`text-center mt-2 ${message.includes("成功")? "text-green-600":"text-red-500"}`}>
          {message}
        </p>
      </form>
      <button
      className="cursor-pointer mt-3 text-red-500 hover:text-red-300"
      onClick={() => {
        router.push("/");
      }}
      >返回首頁</button>
    </div>
  );
}
