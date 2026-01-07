"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed");
      
      setStatus("success");
      setEmail(""); // 入力欄をクリア
    } catch (err) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
        <p className="font-bold">登録完了しました！</p>
        <p className="text-sm">最新情報をお届けします。</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-bold mb-2">メルマガ登録</h3>
      <p className="text-sm text-gray-600 mb-4">
        最新のアップデートやお得な情報をメールでお届けします。
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded focus:ring-2 focus:ring-black outline-none text-gray-900 bg-white"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-800 transition disabled:opacity-50"
        >
          {status === "loading" ? "登録中..." : "登録する"}
        </button>
      </form>
      
      {status === "error" && (
        <p className="text-red-500 text-sm mt-2">登録に失敗しました。再度お試しください。</p>
      )}
    </div>
  );
}