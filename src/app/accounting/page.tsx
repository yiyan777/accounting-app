"use client";

import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

type RecordItem ={
  id: string;
  userId: string;
  amount: number;
  type: "income" | "expense";
  note: string;
  createdAt: Timestamp;
}


export default function AccountingPage() {
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"" | "income" | "expense">("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [user, loading] = useAuthState(auth); // 抓目前登入的使用者與 Loading狀態
  const router = useRouter();

  // 未登入者導回首頁
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // 即時抓資料 + 統計金額
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "accounting"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as RecordItem));

      setRecords(data);

      const income = data
        .filter((r) => r.type === "income")
        .reduce((sum, r) => sum + r.amount, 0);

      const expense = data
        .filter((r) => r.type === "expense")
        .reduce((sum, r) => sum + r.amount, 0);

      setTotalIncome(income);
      setTotalExpense(expense);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage("請先登入");
      return;
    }

    try {
      await addDoc(collection(db, "accounting"), {
        userId: user.uid,
        amount,
        type,
        note,
        createdAt: serverTimestamp(),
      });
      // setMessage("記帳成功！");
      setAmount(0);
      setNote("");
    } catch (err) {
      setMessage("寫入失敗：" + (err instanceof Error ? err.message : "未知錯誤"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 p-4">
        {user && (
          <h1 className="text-xl font-semibold mb-6 text-gray-500 mt-5 text-center mobile-under-490px">
            登入成功！ 
            <br className="sm:hidden"/>
            <span className="font-bold">{user.email}</span>，
            <br className="sm:hidden"/>
            歡迎使用記帳小幫手:)
          </h1>
        )}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-xl">
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                <input
                type="text"
                inputMode="decimal"
                placeholder="金額"
                className="w-full sm:w-20 border border-gray-200  p-2 rounded-md h-10"
                value={amount ===0 ? "": amount}
                onChange={(e) => {
                    const value = e.target.value;
                    const parsed = parseFloat(value);
                    if (!isNaN(parsed)) {
                        setAmount(parsed);
                    } else {
                        setAmount(0);
                    }
                }}
                required
                />
                <select
                  className="w-full sm:w-28 border border-gray-200 p-2 rounded-md h-10 text-gray-400"
                  value={type}
                  onChange={(e) => setType(e.target.value as "income" | "expense")}
                >
                  <option value="" disabled>
                    請選擇
                  </option>
                  <option value="income">收入</option>
                  <option value="expense">支出</option>
                </select>
                <input
                type="text"
                placeholder="備註"
                className="w-full sm:w-60 border border-gray-200 text-gray-700 p-2 rounded-md h-10"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                />
                <button type="submit" className="w-full sm:w-auto bg-purple-500 text-white py-2 rounded hover:bg-purple-400 whitespace-nowrap px-4 cursor-pointer h-10">
                新增紀錄
                </button>
            </div>

            <p className="text-center text-green-600">{message}</p>
        </form>

      {/* 帳目清單 */}
      <ul className="w-full max-w-xl space-y-2 mt-3 text-gray-800">
        {records.map((record) => (
          <li key={record.id}
          className="bg-white rounded shadow p-3 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{record.note}</p>
              <p className="text-sm text-gray-500">
                {record.type === "income" ? "收入" : "支出"}:{record.amount}
              </p>
            </div>
            <button
              onClick={async () => {
                await deleteDoc(doc(db, "accounting", record.id));
              }}
              className="text-red-500 text-sm hover:underline cursor-pointer"
            >
              刪除
            </button>
          </li>
        ))}
      </ul>
      
      {/* 金額統計 */}
      <div className="my-4 text-center text-gray-600 font-bold">
        <p>總收入：<span>{totalIncome}</span></p>
        <p>總支出：<span>{totalExpense}</span></p>
        <p>結餘：<span>{totalIncome - totalExpense}</span></p>
      </div>

      {user && (
        <div className="mt-auto mb-2">
          <button onClick={async () =>{
            await signOut(auth);
            router.push("/");
          }}
          className="text-xl text-red-600 hover:underline cursor-pointer"
          >
            登出
          </button>
        </div>
      )}
    </div>
  );
}
