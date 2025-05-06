"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";



export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true); // 顯示轉圈圈
    router.push("/login");
  }

  return (
    <div className="flex flex-col items-center bg-yellow-100 min-h-screen">
      <div className="bg-[url('/accounting.png')] w-full h-[240px] bg-center"></div>
      <h1 className="text-4xl text-gray-500 mt-10">歡迎使用記帳小幫手</h1>
      <div className="mt-5 text-xl text-gray-500">請點擊下方按鈕進入登入/註冊頁面</div>
      <button 
      className="mt-10 border cursor-pointer px-2 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-400"
      // onClick={() => {
      //   router.push("/login");
      // }}>登入 / 註冊
      onClick={handleClick}
      disabled={loading}
      >
        {loading? "載入中...":"登入 / 註冊"}
      </button>

      {/* 轉圈圖示 */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      )}

    </div>
  );
}
