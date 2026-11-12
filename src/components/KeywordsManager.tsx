"use client";

import { useEffect, useState, FormEvent } from "react";

type Group = { id: string; name: string };
type Keyword = { id: string; content: string; groupId: string };

export default function KeywordsManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newGroup, setNewGroup] = useState("");
  const [kwInputs, setKwInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const [g, k] = await Promise.all([
      fetch("/api/settings/groups").then((r) => r.json()),
      fetch("/api/settings/keywords").then((r) => r.json()),
    ]);
    setGroups(g.list ?? []);
    setKeywords(k.list ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addGroup(e: FormEvent) {
    e.preventDefault();
    if (!newGroup.trim()) return;
    const list = await fetch("/api/settings/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroup.trim(), sortOrder: groups.length }),
    }).then((r) => r.json());
    if (list.item) {
      setNewGroup("");
      load();
    }
  }

  async function deleteGroup(id: string) {
    if (!confirm("删除分组将同时删除组内全部关键词，确认？")) return;
    await fetch(`/api/settings/groups/${id}`, { method: "DELETE" });
    load();
  }

  async function addKeyword(groupId: string) {
    const content = (kwInputs[groupId] ?? "").trim();
    if (!content) return;
    await fetch("/api/settings/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, groupId }),
    });
    setKwInputs({ ...kwInputs, [groupId]: "" });
    load();
  }

  async function deleteKeyword(id: string) {
    await fetch(`/api/settings/keywords/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-sm text-slate-400">加载中…</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800">表现关键词</h1>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        按 7 组分组管理关键词词库，报告端「课堂表现」直接勾选
      </p>

      <form onSubmit={addGroup} className="flex gap-2 mb-6">
        <input
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
          placeholder="新增分组名称"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2">
          添加分组
        </button>
      </form>

      <div className="space-y-4">
        {groups.map((g) => {
          const kws = keywords.filter((k) => k.groupId === g.id);
          return (
            <div
              key={g.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-800">
                  {g.name}
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    {kws.length} 个关键词
                  </span>
                </h2>
                <button
                  onClick={() => deleteGroup(g.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  删除分组
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {kws.map((k) => (
                  <span
                    key={k.id}
                    className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs rounded-full px-3 py-1"
                  >
                    {k.content}
                    <button
                      onClick={() => deleteKeyword(k.id)}
                      className="text-indigo-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {kws.length === 0 && (
                  <span className="text-xs text-slate-400">暂无关键词</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={kwInputs[g.id] ?? ""}
                  onChange={(e) =>
                    setKwInputs({ ...kwInputs, [g.id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword(g.id);
                    }
                  }}
                  placeholder="输入关键词后回车添加"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => addKeyword(g.id)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  添加
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
