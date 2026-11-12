"use client";

import { useEffect, useState } from "react";

type Redeemed = {
  id: string;
  code: string;
  planName: string;
  times: number;
  orgName: string;
  usedAt: string | null;
};
type Log = {
  id: string;
  orgId: string;
  delta: number;
  reason: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [redeemed, setRedeemed] = useState<Redeemed[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform/orders")
      .then((r) => r.json())
      .then((d) => {
        setRedeemed(d.redeemed ?? []);
        setLogs(d.logs ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">订单流水</h1>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        兑换记录与全平台次数流水审计
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">加载中…</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-slate-700 mb-2">兑换记录</h2>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {redeemed.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-4 text-sm">
                  <span className="font-mono text-slate-600 w-48">{r.code}</span>
                  <span className="text-slate-500 w-28">{r.planName}</span>
                  <span className="text-indigo-600 w-16">+{r.times} 次</span>
                  <span className="text-slate-700 flex-1">{r.orgName}</span>
                  <span className="text-slate-400">
                    {r.usedAt
                      ? new Date(r.usedAt).toLocaleString("zh-CN")
                      : "-"}
                  </span>
                </div>
              ))}
              {redeemed.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  暂无兑换记录
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-slate-700 mb-2">次数流水</h2>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {logs.map((l) => (
                <div key={l.id} className="px-4 py-3 flex items-center gap-4 text-sm">
                  <span
                    className={`w-16 font-medium ${
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
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  暂无流水
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
