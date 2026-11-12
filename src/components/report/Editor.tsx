"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReportData, RADAR_DIMS, HABIT_LEVELS } from "@/lib/report";
import { ImageUpload, PhotoUpload } from "../ImageUpload";
import Preview, { PreviewRefs } from "./Preview";

type Ref = { id: string; name: string };
type Group = Ref & { keywords: Ref[] };
export type EditorRefs = {
  org: { name: string; logo: string };
  reportNo: string;
  groups: Group[];
  courses: (Ref & { intro: string })[];
  contests: (Ref & { type: string; intro: string })[];
  comments: { id: string; category: string; title: string; content: string }[];
  tags: Ref[];
  campuses: Ref[];
  teachers: Ref[];
  achievementPresets: (Ref & { type: string })[];
  schedules: (Ref & { date: string })[];
};

type StudentState = {
  id: string;
  name: string;
  avatar: string;
  age: number | null;
  grade: string;
  school: string;
  campusId: string;
  teacherId: string;
  tags: string[];
  photos: string[];
};

const TABS = [
  ["student", "学员信息"],
  ["performance", "课堂表现"],
  ["courses", "入学课程"],
  ["next", "下一阶段"],
  ["contests", "赛事考级"],
  ["radar", "能力雷达"],
  ["growth", "成长与成果"],
  ["plans", "比赛规划"],
  ["comment", "教师寄语"],
] as const;

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function Editor({
  reportId,
  student: initialStudent,
  data: initialData,
  refs,
}: {
  reportId?: string;
  student: StudentState;
  data: ReportData;
  refs: EditorRefs;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("student");
  const [data, setData] = useState<ReportData>(initialData);
  const [student, setStudent] = useState<StudentState>(initialStudent);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savedTip, setSavedTip] = useState("");

  function patch(p: Partial<ReportData>) {
    setData((d) => ({ ...d, ...p }));
  }

  function toggle(list: string[], id: string, max?: number): string[] {
    if (list.includes(id)) return list.filter((x) => x !== id);
    if (max && list.length >= max) return list;
    return [...list, id];
  }

  async function saveStudent() {
    const res = await fetch(`/api/students/${student.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    if (res.ok) {
      setSavedTip("学员信息已保存");
      setTimeout(() => setSavedTip(""), 2000);
      router.refresh();
    }
  }

  async function saveReport(): Promise<string | null> {
    setSaving(true);
    const url = reportId ? `/api/reports/${reportId}` : "/api/reports";
    const res = await fetch(url, {
      method: reportId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, data }),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      if (!reportId && d.report?.id) {
        router.replace(`/reports/${d.report.id}/edit`);
        router.refresh();
        return d.report.id as string;
      }
      return reportId ?? null;
    }
    const d = await res.json().catch(() => ({}));
    alert(d.error || "保存失败");
    return null;
  }

  /** 保存档案：存入学员档案库（不扣次） */
  async function saveArchive() {
    const ok = await saveReport();
    if (ok !== null) {
      setSavedTip("已存入学员档案 ✓");
      setTimeout(() => setSavedTip(""), 2000);
    }
  }

  /** 保存 PDF：导出扣 1 次，同一报告 30 分钟内重复导出免扣次 */
  async function exportPdf() {
    const id = reportId ?? (await saveReport());
    if (!id) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/reports/${id}/pdf`, { method: "POST" });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${refs.reportNo}-${student.name}-成长规划报告.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        setSavedTip(
          res.headers.get("X-Charged") === "true"
            ? "PDF 已导出（扣 1 次）"
            : "PDF 已导出（30 分钟内免扣次）"
        );
        setTimeout(() => setSavedTip(""), 3000);
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "导出失败");
      }
    } finally {
      setExporting(false);
    }
  }

  const previewRefs: PreviewRefs = {
    org: refs.org,
    reportNo: refs.reportNo,
    student: {
      name: student.name,
      avatar: student.avatar,
      age: student.age,
      grade: student.grade,
      school: student.school,
      campus: refs.campuses.find((c) => c.id === student.campusId)?.name ?? "",
      teacher: refs.teachers.find((t) => t.id === student.teacherId)?.name ?? "",
      tags: student.tags
        .map((id) => refs.tags.find((t) => t.id === id)?.name)
        .filter(Boolean) as string[],
      photos: student.photos,
    },
    groups: refs.groups,
    courses: refs.courses,
    contests: refs.contests,
    data,
  };

  return (
    <div>
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/reports"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← 返回列表
        </Link>
        <h1 className="text-lg font-bold text-slate-800">
          编辑报告 <span className="font-mono text-sm text-slate-400">{refs.reportNo}</span>
        </h1>
        <div className="ml-auto flex items-center gap-3">
          {savedTip && <span className="text-sm text-green-600">{savedTip}</span>}
          <button
            onClick={saveArchive}
            disabled={saving}
            className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-60 text-sm font-medium rounded-lg px-4 py-2"
          >
            保存档案
          </button>
          <button
            onClick={exportPdf}
            disabled={saving || exporting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2"
          >
            {exporting ? "生成中…" : "保存 PDF"}
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* 左侧编辑区 */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200">
          <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`text-sm px-3 py-1.5 rounded-lg transition ${
                  tab === key
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-slate-600 hover:bg-indigo-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* 学员信息 */}
            {tab === "student" && (
              <div className="space-y-3 max-w-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">姓名</label>
                    <input
                      className={inputCls}
                      value={student.name}
                      onChange={(e) =>
                        setStudent({ ...student, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">年龄</label>
                    <input
                      type="number"
                      className={inputCls}
                      value={student.age ?? ""}
                      onChange={(e) =>
                        setStudent({
                          ...student,
                          age: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      在读年级
                    </label>
                    <input
                      className={inputCls}
                      value={student.grade}
                      onChange={(e) =>
                        setStudent({ ...student, grade: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      在读学校
                    </label>
                    <input
                      className={inputCls}
                      value={student.school}
                      onChange={(e) =>
                        setStudent({ ...student, school: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      所属校区
                    </label>
                    <select
                      className={inputCls}
                      value={student.campusId}
                      onChange={(e) =>
                        setStudent({ ...student, campusId: e.target.value })
                      }
                    >
                      <option value="">未选择</option>
                      {refs.campuses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      规划老师
                    </label>
                    <select
                      className={inputCls}
                      value={student.teacherId}
                      onChange={(e) =>
                        setStudent({ ...student, teacherId: e.target.value })
                      }
                    >
                      <option value="">未选择</option>
                      {refs.teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <ImageUpload
                  label="学员头像"
                  shape="circle"
                  value={student.avatar}
                  onChange={(url) => setStudent({ ...student, avatar: url })}
                />
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    学员标签（最多 5 个，已选 {student.tags.length}）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {refs.tags.map((t) => {
                      const on = student.tags.includes(t.id);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() =>
                            setStudent({
                              ...student,
                              tags: toggle(student.tags, t.id, 5),
                            })
                          }
                          className={`text-xs rounded-full px-3 py-1 border transition ${
                            on
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-600 border-slate-300"
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <PhotoUpload
                  label="学员照片（最多 6 张）"
                  max={6}
                  value={student.photos}
                  onChange={(photos) => setStudent({ ...student, photos })}
                />
                <button
                  onClick={saveStudent}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2"
                >
                  保存学员信息
                </button>
              </div>
            )}

            {/* 课堂表现 */}
            {tab === "performance" && (
              <div className="space-y-4">
                {refs.groups.map((g) => {
                  const selected = g.keywords.filter((k) =>
                    data.performance.includes(k.id)
                  ).length;
                  return (
                    <div key={g.id}>
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        {g.name}
                        <span className="text-xs text-slate-400 ml-2">
                          已选 {selected}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {g.keywords.map((k) => {
                          const on = data.performance.includes(k.id);
                          return (
                            <button
                              type="button"
                              key={k.id}
                              onClick={() =>
                                patch({ performance: toggle(data.performance, k.id) })
                              }
                              className={`text-xs rounded-full px-3 py-1.5 border transition ${
                                on
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                              }`}
                            >
                              {k.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    成长瞬间（家长视角的一句话总结）
                  </label>
                  <textarea
                    className={inputCls}
                    rows={3}
                    placeholder="如：本阶段共掌握 16 项关键能力，从模仿搭建进步到独立完成动力装置…"
                    value={data.growthMoment}
                    onChange={(e) => patch({ growthMoment: e.target.value })}
                  />
                  <button
                    type="button"
                    className="text-xs text-indigo-600 hover:underline mt-1"
                    onClick={() => {
                      const names = refs.groups
                        .flatMap((g) => g.keywords)
                        .filter((k) => data.performance.includes(k.id))
                        .map((k) => k.name);
                      patch({
                        growthMoment: `本阶段重点表现：${names.slice(0, 8).join("、")}${
                          names.length > 8 ? " 等" : ""
                        }。`,
                      });
                    }}
                  >
                    根据已选关键词自动生成
                  </button>
                </div>
              </div>
            )}

            {/* 入学课程 */}
            {tab === "courses" && (
              <div className="space-y-2">
                {refs.courses.map((c) => {
                  const on = data.courses.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => patch({ courses: toggle(data.courses, c.id) })}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                        on
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-700">
                        <span
                          className={`inline-block w-4 h-4 rounded mr-2 align-middle text-center text-[10px] leading-4 text-white ${
                            on ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        >
                          ✓
                        </span>
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 pl-6">{c.intro}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 下一阶段 */}
            {tab === "next" && (
              <div className="space-y-3 max-w-xl">
                <p className="text-xs text-slate-500">
                  选择下一阶段推荐课程（可多选），并填写阶段说明
                </p>
                <div className="flex flex-wrap gap-2">
                  {refs.courses.map((c) => {
                    const on = data.nextStageCourses.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() =>
                          patch({
                            nextStageCourses: toggle(data.nextStageCourses, c.id),
                          })
                        }
                        className={`text-xs rounded-full px-3 py-1.5 border transition ${
                          on
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-600 border-slate-300"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  className={inputCls}
                  rows={3}
                  placeholder="如：进入进阶阶段，重点提升机械结构与编程综合应用能力…"
                  value={data.nextStageText}
                  onChange={(e) => patch({ nextStageText: e.target.value })}
                />
              </div>
            )}

            {/* 赛事考级 */}
            {tab === "contests" && (
              <div className="space-y-2">
                {refs.contests.map((c) => {
                  const on = data.contests.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => patch({ contests: toggle(data.contests, c.id) })}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                        on
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <p className="text-sm font-medium text-slate-700">
                        <span
                          className={`text-[10px] rounded px-1.5 py-0.5 mr-2 ${
                            c.type === "考级"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {c.type}
                        </span>
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{c.intro}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 能力雷达 */}
            {tab === "radar" && (
              <div className="max-w-md space-y-4">
                <p className="text-xs text-slate-500">
                  对各能力维度按 1-5 分打分，右侧预览实时渲染雷达图
                </p>
                {RADAR_DIMS.map((dim, i) => (
                  <div key={dim}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{dim}</span>
                      <span className="text-indigo-600 font-medium">
                        {data.radar[i]} 分
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={data.radar[i]}
                      onChange={(e) => {
                        const radar = [...data.radar];
                        radar[i] = Number(e.target.value);
                        patch({ radar });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 成长与成果 */}
            {tab === "growth" && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    学习习惯档位（评级口径待评估，暂用三档）
                  </label>
                  <div className="flex gap-2">
                    {HABIT_LEVELS.map((h) => (
                      <button
                        type="button"
                        key={h}
                        onClick={() => patch({ habit: h })}
                        className={`text-sm rounded-lg px-4 py-1.5 border transition ${
                          data.habit === h
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-slate-300 text-slate-600"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      过往学习状态（阶段由老师手动标注）
                    </label>
                    <button
                      type="button"
                      className="text-xs text-indigo-600 hover:underline"
                      onClick={() =>
                        patch({
                          timeline: [
                            ...data.timeline,
                            { stage: "", period: "", note: "" },
                          ],
                        })
                      }
                    >
                      + 添加阶段
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.timeline.map((t, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          className={inputCls}
                          placeholder="阶段名，如：第1阶段 启蒙"
                          value={t.stage}
                          onChange={(e) => {
                            const timeline = [...data.timeline];
                            timeline[i] = { ...t, stage: e.target.value };
                            patch({ timeline });
                          }}
                        />
                        <input
                          className={inputCls}
                          placeholder="时间，如：2025.09-2026.06"
                          value={t.period}
                          onChange={(e) => {
                            const timeline = [...data.timeline];
                            timeline[i] = { ...t, period: e.target.value };
                            patch({ timeline });
                          }}
                        />
                        <input
                          className={inputCls}
                          placeholder="阶段小结"
                          value={t.note}
                          onChange={(e) => {
                            const timeline = [...data.timeline];
                            timeline[i] = { ...t, note: e.target.value };
                            patch({ timeline });
                          }}
                        />
                        <button
                          type="button"
                          className="text-red-500 text-sm shrink-0"
                          onClick={() =>
                            patch({
                              timeline: data.timeline.filter((_, j) => j !== i),
                            })
                          }
                        >
                          删除
                        </button>
                      </div>
                    ))}
                    {data.timeline.length === 0 && (
                      <p className="text-xs text-slate-400">暂无阶段记录</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      学习成果（预置选择或自由填写）
                    </label>
                    <button
                      type="button"
                      className="text-xs text-indigo-600 hover:underline"
                      onClick={() =>
                        patch({
                          achievements: [
                            ...data.achievements,
                            { name: "", type: "奖章" },
                          ],
                        })
                      }
                    >
                      + 添加成果
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.achievements.map((a, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <select
                          className={inputCls + " w-28"}
                          value={a.type}
                          onChange={(e) => {
                            const achievements = [...data.achievements];
                            achievements[i] = { ...a, type: e.target.value };
                            patch({ achievements });
                          }}
                        >
                          {["奖章", "等级", "目标"].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                        <input
                          className={inputCls}
                          list="achievement-presets"
                          placeholder="成果名称（可选预置）"
                          value={a.name}
                          onChange={(e) => {
                            const achievements = [...data.achievements];
                            achievements[i] = { ...a, name: e.target.value };
                            patch({ achievements });
                          }}
                        />
                        <button
                          type="button"
                          className="text-red-500 text-sm shrink-0"
                          onClick={() =>
                            patch({
                              achievements: data.achievements.filter(
                                (_, j) => j !== i
                              ),
                            })
                          }
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                  <datalist id="achievement-presets">
                    {refs.achievementPresets.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.type}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>
            )}

            {/* 比赛规划 */}
            {tab === "plans" && (
              <div className="max-w-xl space-y-4">
                <p className="text-xs text-slate-500">
                  从机构赛事日程快速加入，或自由填写；标记报名/参与/获奖状态
                </p>
                <button
                  type="button"
                  className="text-xs text-indigo-600 hover:underline"
                  onClick={() =>
                    patch({
                      plans: [
                        ...data.plans,
                        { name: "", date: "", status: "计划参加", note: "" },
                      ],
                    })
                  }
                >
                  + 添加计划
                </button>
                <div className="space-y-2">
                  {data.plans.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        className={inputCls}
                        list="schedule-presets"
                        placeholder="赛事名称"
                        value={p.name}
                        onChange={(e) => {
                          const plans = [...data.plans];
                          plans[i] = { ...p, name: e.target.value };
                          patch({ plans });
                        }}
                      />
                      <input
                        type="date"
                        className={inputCls + " w-36"}
                        value={p.date}
                        onChange={(e) => {
                          const plans = [...data.plans];
                          plans[i] = { ...p, date: e.target.value };
                          patch({ plans });
                        }}
                      />
                      <select
                        className={inputCls + " w-28"}
                        value={p.status}
                        onChange={(e) => {
                          const plans = [...data.plans];
                          plans[i] = { ...p, status: e.target.value };
                          patch({ plans });
                        }}
                      >
                        {["计划参加", "已报名", "已参与", "获奖"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="text-red-500 text-sm shrink-0"
                        onClick={() =>
                          patch({ plans: data.plans.filter((_, j) => j !== i) })
                        }
                      >
                        删除
                      </button>
                    </div>
                  ))}
                  {data.plans.length === 0 && (
                    <p className="text-xs text-slate-400">暂无比赛计划</p>
                  )}
                </div>
                <datalist id="schedule-presets">
                  {refs.schedules.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.date}
                    </option>
                  ))}
                </datalist>
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    机构赛事日程（点击快速加入）
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {refs.schedules.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        className="text-xs rounded-full border border-slate-300 px-3 py-1 hover:border-indigo-400"
                        onClick={() =>
                          patch({
                            plans: [
                              ...data.plans,
                              {
                                name: s.name,
                                date: s.date,
                                status: "计划参加",
                                note: "",
                              },
                            ],
                          })
                        }
                      >
                        {s.name}（{s.date || "待定"}）
                      </button>
                    ))}
                    {refs.schedules.length === 0 && (
                      <span className="text-xs text-slate-400">
                        暂无日程，可在「机构设置 → 机构赛事日程」维护
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 教师寄语 */}
            {tab === "comment" && (
              <div className="max-w-xl space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    引用评语模板
                  </label>
                  <select
                    className={inputCls}
                    value=""
                    onChange={(e) => {
                      const tpl = refs.comments.find((c) => c.id === e.target.value);
                      if (tpl) patch({ comment: tpl.content });
                    }}
                  >
                    <option value="">选择模板…</option>
                    {refs.comments.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.category}（{c.title}）
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  className={inputCls}
                  rows={6}
                  placeholder="写给家长的寄语…"
                  value={data.comment}
                  onChange={(e) => patch({ comment: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>

        {/* 右侧实时预览 */}
        <div>
          <p className="text-xs text-slate-400 mb-2">
            实时预览 · 家长收到的效果
          </p>
          <Preview refs={previewRefs} />
        </div>
      </div>
    </div>
  );
}
