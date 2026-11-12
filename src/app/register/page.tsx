"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    orgName: "",
    address: "",
    phone: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "注册失败");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">注册机构账号</h1>
          <p className="text-indigo-300 text-sm mt-2">
            注册后自动初始化课程体系、关键词库等预置数据，并赠送 10 次体验次数
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              机构名称 *
            </label>
            <input
              value={form.orgName}
              onChange={set("orgName")}
              className={inputCls}
              placeholder="如：黄昏智创机器人教育"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              机构地址
            </label>
            <input value={form.address} onChange={set("address")} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              联系方式
            </label>
            <input value={form.phone} onChange={set("phone")} className={inputCls} />
          </div>
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              登录账号 *
            </label>
            <input
              value={form.username}
              onChange={set("username")}
              className={inputCls}
              placeholder="用于登录本系统"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              密码 *（至少 6 位）
            </label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              className={inputCls}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition"
          >
            {loading ? "注册中…" : "注册并初始化"}
          </button>
          <p className="text-sm text-slate-500 text-center">
            已有账号？
            <Link href="/login" className="text-indigo-600 hover:underline">
              直接登录
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
