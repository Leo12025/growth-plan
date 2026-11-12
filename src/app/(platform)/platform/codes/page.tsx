"use client";

import { useEffect, useState, FormEvent } from "react";

type Plan = { id: string; name: string; times: number };
type Code = {
  id: string;
  code: string;
  planName: string;
  times: number;
  status: string;
  orgName: string;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  UNUSED: { label: "未使用", cls: "bg-emerald-50 text-emerald-600" },
  USED: { label: "已使用", cls: "bg-slate-100 text-slate-500" },
  VOID: { label: "已作废", cls: "bg-red-50 text-red-500" },
};

export default function CodesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [list, setList] = useState<Code[]>([]);
  const [form, setForm] = useState({ planId: "", count: "10", validDays: "365" });
  const [loading, setLoading] = useState(true);

  async function load() {
    const [p, c] = await Promise.all([
      fetch("/api/platform/plans").then((r) => r.json()),
      fetch("/api/platform/codes").then((r) => r.json()),
    ]);
    setPlans(p.list ?? []);
    setList(c.list ?? []);
    if (p.list?.[0] && !form.planId) {
      setForm((f) => ({ ...f, planId: p.list[0].id }));
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/platform/codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      const codes = (d.list as Code[]).map((c) => c.code).join("\n");
      await navigator.clipboard?.writeText(codes).catch(() => {});
      alert(`已生成 ${d.list.length} 个兑换码（已尝试复制到剪贴板）：\n${codes}`);
      load();
    } else alert((await res.json()).error || "生成失败");
  }

  async function voidCode(c: Code) {
    if (!confirm(`作废兑换码 ${c.code}？`)) return;
    const res = await fetch(`/api/platform/codes/${c.id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert((await res.json()).error || "操作失败");
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">兑换码</h1>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        生成后发给机构，机构在「机构设置 → 套餐与兑换」中输入充值
      </p>

      <form
        onSubmit={generate}
        className="bg-white rounded-xl border border-slate-200 p-4 mb-6 grid gap-3 sm:grid-cols-4"
      >
        <select
          className={inputCls}
          value={form.planId}
          onChange={(e) => setForm({ ...form, planId: e.target.value })}
        >
          <option value="">自定义次数…</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}（{p.times} 次）
            </option>
          ))}
        </select>
        <input
          className={inputCls}
          type="number"
          min={1}
          max={100}
          value={form.count}
          onChange={(e) => setForm({ ...form, count: e.target.value })}
          placeholder="生成数量"
        />
        <input
          className={inputCls}
          type="number"
          value={form.validDays}
          onChange={(e) => setForm({ ...form, validDays: e.target.value })}
          placeholder="有效期（天）"
        />
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2">
          批量生成
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">加载中…</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {list.map((c) => {
            const st = STATUS[c.status] ?? STATUS.UNUSED;
            return (
              <div
                key={c.id}
                className="px-4 py-3 flex items-center gap-4 text-sm"
              >
                <span className="font-mono text-slate-700 w-48">{c.code}</span>
                <span className="text-slate-500 w-28">{c.planName}</span>
                <span className="text-slate-600 w-16">{c.times} 次</span>
                <span
                  className={`text-xs rounded px-2 py-0.5 w-16 text-center ${st.cls}`}
                >
                  {st.label}
                </span>
                <span className="text-slate-400 flex-1 truncate">
                  {c.status === "USED"
                    ? `${c.orgName} · ${c.usedAt ? new Date(c.usedAt).toLocaleString("zh-CN") : ""}`
                    : c.expiresAt
                      ? `有效期至 ${new Date(c.expiresAt).toLocaleDateString("zh-CN")}`
                      : ""}
                </span>
                {c.status === "UNUSED" && (
                  <button
                    onClick={() => voidCode(c)}
                    className="text-red-500 hover:underline"
                  >
                    作废
                  </button>
                )}
              </div>
            );
          })}
          {list.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              暂无兑换码
            </p>
          )}
        </div>
      )}
    </div>
  );
}
