"use client";

import { useEffect, useState, FormEvent } from "react";

type Plan = {
  id: string;
  name: string;
  price: number;
  times: number;
  validDays: number;
  active: boolean;
};

export default function PlansPage() {
  const [list, setList] = useState<Plan[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    times: "",
    validDays: "365",
  });
  const [loading, setLoading] = useState(true);

  async function load() {
    const d = await fetch("/api/platform/plans").then((r) => r.json());
    setList(d.list ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/platform/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", price: "", times: "", validDays: "365" });
      load();
    }
  }

  async function toggle(p: Plan) {
    await fetch(`/api/platform/plans/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    load();
  }

  async function remove(p: Plan) {
    if (!confirm(`删除套餐「${p.name}」？`)) return;
    await fetch(`/api/platform/plans/${p.id}`, { method: "DELETE" });
    load();
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">套餐配置</h1>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        机构可购买的次数套餐，用于生成兑换码与机构侧展示
      </p>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl border border-slate-200 p-4 mb-6 grid gap-3 sm:grid-cols-5"
      >
        <input
          className={inputCls}
          placeholder="套餐名称，如：日常版"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="价格（元）"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="次数"
          type="number"
          required
          value={form.times}
          onChange={(e) => setForm({ ...form, times: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="有效期（天）"
          type="number"
          value={form.validDays}
          onChange={(e) => setForm({ ...form, validDays: e.target.value })}
        />
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2">
          添加套餐
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">加载中…</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <div className="px-4 py-2 grid grid-cols-12 text-xs text-slate-400">
            <span className="col-span-3">套餐</span>
            <span className="col-span-2">价格</span>
            <span className="col-span-2">次数</span>
            <span className="col-span-2">有效期</span>
            <span className="col-span-3 text-right">操作</span>
          </div>
          {list.map((p) => (
            <div
              key={p.id}
              className="px-4 py-3 grid grid-cols-12 items-center text-sm"
            >
              <span className="col-span-3 font-medium text-slate-800">
                {p.name}
                {!p.active && (
                  <span className="text-xs text-slate-400 ml-2">已停用</span>
                )}
              </span>
              <span className="col-span-2 text-slate-600">￥{p.price}</span>
              <span className="col-span-2 text-slate-600">{p.times} 次</span>
              <span className="col-span-2 text-slate-600">{p.validDays} 天</span>
              <div className="col-span-3 flex gap-3 justify-end">
                <button
                  onClick={() => toggle(p)}
                  className="text-indigo-600 hover:underline"
                >
                  {p.active ? "停用" : "启用"}
                </button>
                <button
                  onClick={() => remove(p)}
                  className="text-red-500 hover:underline"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              暂无套餐，建议先添加「99 元 / 200 次」「199 元 / 500 次」
            </p>
          )}
        </div>
      )}
    </div>
  );
}
