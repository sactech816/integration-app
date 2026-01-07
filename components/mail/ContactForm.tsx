"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="p-8 text-center border-2 border-green-500 rounded-lg bg-green-50">
        <h3 className="text-xl font-bold text-green-700 mb-2">送信完了</h3>
        <p>お問い合わせありがとうございます。<br />内容を確認次第、ご連絡いたします。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 border rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-bold mb-4">お問い合わせ</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="font-bold text-sm mb-1">お名前</span>
          <input name="name" type="text" required className="border p-2 rounded text-gray-900 bg-white" placeholder="山田 太郎" />
        </label>
        <label className="flex flex-col">
          <span className="font-bold text-sm mb-1">メールアドレス</span>
          <input name="email" type="email" required className="border p-2 rounded text-gray-900 bg-white" placeholder="example@gmail.com" />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="font-bold text-sm mb-1">件名</span>
        <input name="subject" type="text" required className="border p-2 rounded text-gray-900 bg-white" placeholder="お仕事の依頼について" />
      </label>

      <label className="flex flex-col">
        <span className="font-bold text-sm mb-1">メッセージ</span>
        <textarea name="message" rows={5} required className="border p-2 rounded text-gray-900 bg-white" placeholder="詳細をご記入ください" />
      </label>

      <button type="submit" disabled={status === "loading"} className="bg-black text-white font-bold py-3 px-6 rounded hover:bg-gray-800 disabled:opacity-50">
        {status === "loading" ? "送信中..." : "送信する"}
      </button>
      
      {status === "error" && <p className="text-red-500 text-sm">送信に失敗しました。</p>}
    </form>
  );
}