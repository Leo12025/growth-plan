"use client";

import { ReportData } from "@/lib/report";
import Radar from "./Radar";

type Ref = { id: string; name: string };
type Group = Ref & { keywords: Ref[] };

export type PreviewRefs = {
  org: { name: string; logo: string };
  reportNo: string;
  student: {
    name: string;
    avatar: string;
    age: number | null;
    grade: string;
    school: string;
    campus: string;
    teacher: string;
    tags: string[];
    photos: string[];
  };
  groups: Group[];
  courses: (Ref & { intro: string })[];
  contests: (Ref & { type: string; intro: string })[];
  data: ReportData;
};

function Section({
  no,
  title,
  children,
}: {
  no: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
          {no}
        </span>
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Preview({ refs }: { refs: PreviewRefs }) {
  const { org, reportNo, student, groups, courses, contests, data } = refs;
  const today = new Date().toLocaleDateString("zh-CN");

  const selectedKeywords = groups.flatMap((g) =>
    g.keywords.filter((k) => data.performance.includes(k.id))
  );

  return (
    <div className="w-[375px] shrink-0 rounded-2xl bg-gradient-to-b from-indigo-950 to-blue-900 p-3 shadow-xl max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="bg-white rounded-xl overflow-hidden">
        {/* 头图 */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white px-5 py-6 text-center">
          <p className="text-xs opacity-80">
            {org.name || "机构名称"} · {today}
          </p>
          <h2 className="text-lg font-bold mt-1">学生成长规划器</h2>
          <p className="text-[10px] tracking-[0.3em] opacity-70 mt-1">
            GROWTH PLAN · NO. {reportNo}
          </p>
        </div>

        {/* 学员卡片 */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
          {student.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={student.avatar}
              alt="avatar"
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
              {student.name?.[0] ?? "学"}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-slate-800">{student.name || "学员姓名"}</p>
            <p className="text-xs text-slate-500">
              {[student.age ? `${student.age}岁` : "", student.grade, student.school]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              规划老师：{student.teacher || "-"} · {student.campus}
            </p>
          </div>
        </div>
        {student.tags.length > 0 && (
          <div className="px-5 py-2 flex flex-wrap gap-1 border-b border-slate-100">
            {student.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {data.growthMoment && (
          <div className="px-5 py-3 text-sm text-slate-600 bg-amber-50/60 border-b border-slate-100">
            <span className="font-medium text-amber-700">成长瞬间：</span>
            {data.growthMoment}
          </div>
        )}

        <div className="px-5 py-4">
          {/* ① 课堂表现 */}
          {selectedKeywords.length > 0 && (
            <Section no="1" title="课堂表现">
              <div className="flex flex-wrap gap-1.5">
                {selectedKeywords.map((k) => (
                  <span
                    key={k.id}
                    className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1"
                  >
                    {k.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* ② 入学课程规划 */}
          {data.courses.length > 0 && (
            <Section no="2" title="入学课程规划">
              <div className="space-y-2">
                {data.courses.map((cid) => {
                  const c = courses.find((x) => x.id === cid);
                  if (!c) return null;
                  return (
                    <div
                      key={cid}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        {c.name}
                      </p>
                      {c.intro ? (
                        <p className="text-xs text-slate-500 mt-0.5">{c.intro}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* 能力展示（雷达图） */}
          <Section no="3" title="能力展示">
            <div className="flex justify-center">
              <Radar scores={data.radar} size={200} />
            </div>
          </Section>

          {/* ③ 下一阶段安排 */}
          {(data.nextStageText || data.nextStageCourses.length > 0) && (
            <Section no="4" title="下一阶段安排">
              {data.nextStageCourses.length > 0 && (
                <p className="text-sm font-medium text-indigo-700 mb-1">
                  {data.nextStageCourses
                    .map((cid) => courses.find((c) => c.id === cid)?.name)
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {data.nextStageText && (
                <p className="text-sm text-slate-600">{data.nextStageText}</p>
              )}
            </Section>
          )}

          {/* ④ 赛事考级 */}
          {data.contests.length > 0 && (
            <Section no="5" title="赛事考级">
              <div className="space-y-2">
                {data.contests.map((cid) => {
                  const c = contests.find((x) => x.id === cid);
                  if (!c) return null;
                  return (
                    <div
                      key={cid}
                      className="rounded-lg border border-slate-200 px-3 py-2"
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
                      <p className="text-xs text-slate-500 mt-0.5">{c.intro}</p>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* 习惯回馈 */}
          <Section no="6" title="习惯回馈">
            <p className="text-sm text-slate-600">
              学习习惯：
              <span
                className={`font-bold ml-1 ${
                  data.habit === "领先"
                    ? "text-emerald-600"
                    : data.habit === "良好"
                      ? "text-indigo-600"
                      : "text-amber-600"
                }`}
              >
                {data.habit}
              </span>
            </p>
            <div className="h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  data.habit === "领先"
                    ? "bg-emerald-500 w-full"
                    : data.habit === "良好"
                      ? "bg-indigo-500 w-2/3"
                      : "bg-amber-500 w-1/3"
                }`}
              />
            </div>
          </Section>

          {/* 过往学习状态 */}
          {data.timeline.length > 0 && (
            <Section no="7" title="过往学习状态">
              <div className="space-y-3 border-l-2 border-indigo-200 pl-4">
                {data.timeline.map((t, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <p className="text-sm font-medium text-slate-700">
                      {t.stage}
                      {t.period && (
                        <span className="text-xs text-slate-400 ml-2">
                          {t.period}
                        </span>
                      )}
                    </p>
                    {t.note && (
                      <p className="text-xs text-slate-500">{t.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 学习成果 */}
          {data.achievements.length > 0 && (
            <Section no="8" title="学习成果">
              <div className="flex flex-wrap gap-2">
                {data.achievements.map((a, i) => (
                  <span
                    key={i}
                    className="text-xs rounded-lg border border-amber-200 bg-amber-50 text-amber-700 px-2.5 py-1"
                  >
                    {a.type} · {a.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* 比赛规划 */}
          {data.plans.length > 0 && (
            <Section no="9" title="比赛规划">
              <div className="space-y-2">
                {data.plans.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <span className="text-xs text-slate-400 w-20 shrink-0">
                      {p.date || "待定"}
                    </span>
                    <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">
                      {p.name}
                    </span>
                    <span
                      className={`text-[10px] rounded px-1.5 py-0.5 shrink-0 ${
                        p.status === "获奖"
                          ? "bg-amber-100 text-amber-700"
                          : p.status === "已参与"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ⑤ 教师寄语 */}
          {data.comment && (
            <Section no="10" title="教师寄语">
              <p className="text-sm text-slate-600 leading-relaxed bg-indigo-50/60 rounded-lg p-3">
                {data.comment}
              </p>
            </Section>
          )}
        </div>

        {/* 页脚 */}
        <div className="bg-slate-50 px-5 py-4 text-center">
          <p className="text-xs text-slate-400">
            {org.name || "机构名称"} · 用心记录每一步成长
          </p>
        </div>
      </div>
    </div>
  );
}
