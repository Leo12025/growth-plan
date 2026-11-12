"use client";

import { useEffect, useState } from "react";

type Plan = { id: string; name: string; price: number; times: number; validDays: number };
type Log = { id: string; delta: number; reason: string; createdAt: string };

export default function QuotaPanel() {
  const [balance, setBalance] = useState<number | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await fetch("/api/quota/info").then((r) => r.json());
    setBalance(d.balance ?? 0);
    setPlans(d.plans ?? []);
    setLogs(d.logs ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function redeem() {
    if (!code.trim()) return;
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/quota/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const d = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg(`兑换成功，+${d.times} 次`);
      setCode("");
      load();
    } else {
      setMsg(d.error || "兑换失败");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">套餐与兑换</h1>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        导出报告 PDF 每次消耗 1 次；同一报告 30 分钟内重复导出不扣次
      </p>

      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500 mb-1">剩余可用次数</p>
          <p className="text-4xl font-bold text-indigo-700 mb-4">
            {balance ?? "…"}
          </p>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            兑换码充值
          </label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="输入兑换码，如 GP12AB-34CD-56EF"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={redeem}
              disabled={busy}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2"
            >
              {busy ? "兑换中…" : "兑换"}
            </button>
          </div>
          {msg && (
            <p
              className={`text-sm mt-2 ${
                msg.includes("成功") ? "text-green-600" : "text-red-500"
              }`}
            >
              {msg}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-700 mb-3">可选套餐</p>
          <div className="space-y-2">
            {plans.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="text-slate-700">{p.name}</span>
                <span className="text-slate-500">{p.times} 次</span>
                <span className="font-semibold text-indigo-700">
                  ￥{p.price}
                </span>
              </div>
            ))}
            {plans.length === 0 && (
              <p className="text-xs text-slate-400">
                暂未配置套餐，请联系平台获取兑换码
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 max-w-3xl">
        <h2 className="font-semibold text-slate-700 mb-2">次数流水</h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {logs.map((l) => (
            <div key={l.id} className="px-4 py-2.5 flex items-center gap-4 text-sm">
              <span
                className={`w-14 font-medium ${
                  l.delta > 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {l.delta > 0 ? `+${l.delta}` : l.delta}
              </span>
              <span className="text-slate-600 flex-1">{l.reason}</span>
              <span className="text-slate-400">
                {new Date(l.createdAt).toLocaleString("zh-CN")}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">
              暂无流水
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
