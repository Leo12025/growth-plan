"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { ImageUpload, PhotoUpload } from "./ImageUpload";

type Ref = { id: string; name: string };
type Student = {
  id: string;
  name: string;
  avatar: string;
  age: number | null;
  grade: string;
  school: string;
  campusId: string | null;
  teacherId: string | null;
  tags: string;
  photos: string;
};

const emptyForm = {
  name: "",
  avatar: "",
  age: "",
  grade: "",
  school: "",
  campusId: "",
  teacherId: "",
  tags: [] as string[],
  photos: [] as string[],
};

export default function StudentManager({
  campuses,
  teachers,
  tags,
}: {
  campuses: Ref[];
  teachers: Ref[];
  tags: Ref[];
}) {
  const [list, setList] = useState<Student[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await fetch("/api/students").then((r) => r.json());
    setList(data.list ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function startEdit(s: Student) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      avatar: s.avatar,
      age: s.age ? String(s.age) : "",
      grade: s.grade,
      school: s.school,
      campusId: s.campusId ?? "",
      teacherId: s.teacherId ?? "",
      tags: JSON.parse(s.tags || "[]"),
      photos: JSON.parse(s.photos || "[]"),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const url = editingId ? `/api/students/${editingId}` : "/api/students";
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
    if (!confirm("删除学员将同时删除其全部报告，确认？")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    load();
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">学员管理</h1>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            学员是报告的主体，先建档再生成成长规划报告
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">姓名 *</label>
            <input
              className={inputCls}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">年龄</label>
            <input
              type="number"
              className={inputCls}
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">在读年级</label>
            <input
              className={inputCls}
              placeholder="如：七年级"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">在读学校</label>
            <input
              className={inputCls}
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">所属校区</label>
            <select
              className={inputCls}
              value={form.campusId}
              onChange={(e) => setForm({ ...form, campusId: e.target.value })}
            >
              <option value="">未选择</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">规划老师</label>
            <select
              className={inputCls}
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
            >
              <option value="">未选择</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <ImageUpload
              label="学员头像（报告封面展示）"
              shape="circle"
              value={form.avatar}
              onChange={(url) => setForm({ ...form, avatar: url })}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs text-slate-500 mb-1">
              学员标签（最多 5 个，已选 {form.tags.length}）
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const on = form.tags.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() =>
                      setForm({
                        ...form,
                        tags: on
                          ? form.tags.filter((x) => x !== t.id)
                          : form.tags.length >= 5
                            ? form.tags
                            : [...form.tags, t.id],
                      })
                    }
                    className={`text-xs rounded-full px-3 py-1 border transition ${
                      on
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sm:col-span-3">
            <PhotoUpload
              label="学员照片（最多 6 张）"
              max={6}
              value={form.photos}
              onChange={(photos) => setForm({ ...form, photos })}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2"
          >
            {editingId ? "保存修改" : "添加学员"}
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
        <p className="text-sm text-slate-400">暂无学员</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {list.map((s) => {
            const tagNames = (JSON.parse(s.tags || "[]") as string[])
              .map((id) => tags.find((t) => t.id === id)?.name)
              .filter(Boolean);
            return (
              <div key={s.id} className="px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800">{s.name}</span>
                  <span className="text-sm text-slate-400 ml-3">
                    {[s.age ? `${s.age}岁` : "", s.grade, s.school]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {tagNames.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {tagNames.map((n) => (
                        <span
                          key={n}
                          className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  href={`/reports/new?student=${s.id}`}
                  className="text-sm text-indigo-600 hover:underline shrink-0"
                >
                  写报告
                </Link>
                <button
                  onClick={() => startEdit(s)}
                  className="text-sm text-indigo-600 hover:underline shrink-0"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  className="text-sm text-red-500 hover:underline shrink-0"
                >
                  删除
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
