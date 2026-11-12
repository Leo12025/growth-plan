"use client";

import { useState, FormEvent } from "react";
import { Org } from "@prisma/client";
import { ImageUpload } from "./ImageUpload";

export default function BrandForm({ org }: { org: Org }) {
  const [form, setForm] = useState({
    name: org.name,
    address: org.address,
    phone: org.phone,
    logo: org.logo,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/org", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">品牌与校区</h1>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        品牌信息将展示在报告头部与页脚；校区在学员信息「所属校区」中选用
      </p>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 max-w-xl space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            机构名称
          </label>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <ImageUpload
          label="机构 Logo（用于报告头部）"
          value={form.logo}
          onChange={(url) => setForm({ ...form, logo: url })}
        />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            机构地址
          </label>
          <input
            className={inputCls}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            联系方式
          </label>
          <input
            className={inputCls}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2"
          >
            {saving ? "保存中…" : "保存"}
          </button>
          {saved && (
            <span className="text-sm text-green-600">已保存 ✓</span>
          )}
        </div>
      </form>
    </div>
  );
}
