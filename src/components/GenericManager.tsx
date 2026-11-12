"use client";

import { useEffect, useState, FormEvent } from "react";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "date";
  options?: string[];
  placeholder?: string;
};

type Row = Record<string, unknown> & { id: string };

export default function GenericManager({
  resource,
  title,
  description,
  fields,
  columns,
}: {
  resource: string;
  title: string;
  description?: string;
  fields: Field[];
  columns: { key: string; label: string }[];
}) {
  const [list, setList] = useState<Row[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/settings/${resource}`);
    const data = await res.json();
    setList(data.list ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  function startEdit(row: Row) {
    const f: Record<string, string> = {};
    for (const fd of fields) f[fd.key] = String(row[fd.key] ?? "");
    setForm(f);
    setEditingId(row.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setForm({});
    setEditingId(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const url = editingId
      ? `/api/settings/${resource}/${editingId}`
      : `/api/settings/${resource}`;
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      reset();
      load();
    }
  }

  async function onDelete(id: string) {
    if (!confirm("确认删除？")) return;
    await fetch(`/api/settings/${resource}/${id}`, { method: "DELETE" });
    load();
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      {description && (
        <p className="text-sm text-slate-500 mt-1 mb-4">{description}</p>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((f) =>
            f.type === "textarea" ? (
              <div key={f.key} className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1">
                  {f.label}
                </label>
                <textarea
                  className={inputCls}
                  rows={2}
                  placeholder={f.placeholder}
                  value={form[f.key] ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                />
              </div>
            ) : f.type === "select" ? (
              <div key={f.key}>
                <label className="block text-xs text-slate-500 mb-1">
                  {f.label}
                </label>
                <select
                  className={inputCls}
                  value={form[f.key] ?? f.options?.[0] ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                >
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div key={f.key}>
                <label className="block text-xs text-slate-500 mb-1">
                  {f.label}
                </label>
                <input
                  type={f.type === "date" ? "date" : "text"}
                  className={inputCls}
                  placeholder={f.placeholder}
                  value={form[f.key] ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                />
              </div>
            )
          )}
        </div>
        <div className="flex gap-2">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2"
            type="submit"
          >
            {editingId ? "保存修改" : "添加"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="text-sm text-slate-500 px-3 py-2 hover:text-slate-700"
            >
              取消
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">加载中…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-slate-400">暂无数据</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {list.map((row, i) => (
            <div key={row.id} className="px-4 py-3 flex items-start gap-4">
              <span className="text-xs text-slate-400 w-6 pt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {columns.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <span className="text-xs text-slate-400 mr-1">
                        {c.label}
                      </span>
                      <span
                        className={
                          c.key === columns[0].key
                            ? "font-medium text-slate-800"
                            : "text-sm text-slate-600 break-all"
                        }
                      >
                        {String(row[c.key] ?? "-")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 text-sm shrink-0">
                <button
                  onClick={() => startEdit(row)}
                  className="text-indigo-600 hover:underline"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDelete(row.id)}
                  className="text-red-500 hover:underline"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
