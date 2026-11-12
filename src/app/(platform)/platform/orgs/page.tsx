"use client";

import { useEffect, useState, FormEvent } from "react";

type Org = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  account: { username: string } | null;
  quota: { balance: number } | null;
  _count: { reports: number; students: number };
};

export default function PlatformOrgsPage() {
  const [list, setList] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrg, setNewOrg] = useState({
    name: "",
    username: "",
    password: "",
    initQuota: "0",
  });
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    const d = await fetch("/api/platform/orgs").then((r) => r.json());
    setList(d.list ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function adjust(org: Org) {
    const input = prompt(
      `为「${org.name}」调整次数（正数充值 / 负数扣减）：`,
      "100"
    );
    if (!input) return;
    const delta = Number(input);
    if (!delta) return;
    const res = await fetch(`/api/platform/orgs/${org.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "quota", delta, reason: "平台手动调整" }),
    });
    if (res.ok) load();
    else alert((await res.json()).error || "操作失败");
  }

  async function resetPwd(org: Org) {
    const pwd = prompt(`重置「${org.name}」的登录密码（至少 6 位）：`);
    if (!pwd) return;
    const res = await fetch(`/api/platform/orgs/${org.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "password", password: pwd }),
    });
    if (res.ok) alert("密码已重置");
    else alert((await res.json()).error || "操作失败");
  }

  async function createOrg(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/platform/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrg),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewOrg({ name: "", username: "", password: "", initQuota: "0" });
      load();
    } else alert((await res.json()).error || "创建失败");
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">机构管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            共 {list.length} 家机构，可调整次数、重置密码
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2"
        >
          {showCreate ? "收起" : "+ 新建机构"}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={createOrg}
          className="bg-white rounded-xl border border-slate-200 p-4 mb-4 grid gap-3 sm:grid-cols-4"
        >
          <input
            className={inputCls}
            placeholder="机构名称"
            required
            value={newOrg.name}
            onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="登录账号"
            required
            value={newOrg.username}
            onChange={(e) => setNewOrg({ ...newOrg, username: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="初始密码"
            required
            value={newOrg.password}
            onChange={(e) => setNewOrg({ ...newOrg, password: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              className={inputCls}
              placeholder="赠送次数"
              value={newOrg.initQuota}
              onChange={(e) =>
                setNewOrg({ ...newOrg, initQuota: e.target.value })
              }
            />
            <button className="bg-indigo-600 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap">
              创建
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">加载中…</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <div className="px-4 py-2 grid grid-cols-12 text-xs text-slate-400">
            <span className="col-span-3">机构</span>
            <span className="col-span-2">登录账号</span>
            <span className="col-span-2">剩余次数</span>
            <span className="col-span-2">学员 / 报告</span>
            <span className="col-span-3 text-right">操作</span>
          </div>
          {list.map((o) => (
            <div
              key={o.id}
              className="px-4 py-3 grid grid-cols-12 items-center text-sm"
            >
              <div className="col-span-3">
                <p className="font-medium text-slate-800">{o.name}</p>
                <p className="text-xs text-slate-400">
                  {new Date(o.createdAt).toLocaleDateString("zh-CN")} 入驻
                </p>
              </div>
              <span className="col-span-2 text-slate-600">
                {o.account?.username ?? "-"}
              </span>
              <span className="col-span-2 font-semibold text-indigo-700">
                {o.quota?.balance ?? 0}
              </span>
              <span className="col-span-2 text-slate-500">
                {o._count.students} / {o._count.reports}
              </span>
              <div className="col-span-3 flex gap-3 justify-end">
                <button
                  onClick={() => adjust(o)}
                  className="text-indigo-600 hover:underline"
                >
                  调整次数
                </button>
                <button
                  onClick={() => resetPwd(o)}
                  className="text-slate-500 hover:underline"
                >
                  重置密码
                </button>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              暂无机构
            </p>
          )}
        </div>
      )}
    </div>
  );
}
