import Link from "next/link";
import { requireOrg } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadEditorRefs, loadStudent } from "@/lib/editor-data";
import { DEFAULT_REPORT_DATA } from "@/lib/report";
import Editor from "@/components/report/Editor";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const ctx = await requireOrg();
  if (!ctx) return null;
  const { student: studentId } = await searchParams;

  if (!studentId) {
    const students = await db.student.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
    });
    return (
      <div>
        <Link href="/reports" className="text-sm text-slate-500 hover:text-slate-700">
          ← 返回列表
        </Link>
        <h1 className="text-xl font-bold text-slate-800 my-4">选择学员</h1>
        {students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 mb-3">还没有学员档案</p>
            <Link
              href="/students"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2"
            >
              去创建学员
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {students.map((s) => (
              <Link
                key={s.id}
                href={`/reports/new?student=${s.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-400 transition"
              >
                <p className="font-medium text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {[s.age ? `${s.age}岁` : "", s.grade, s.school]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const [refs, student] = await Promise.all([
    loadEditorRefs(ctx.orgId),
    loadStudent(ctx.orgId, studentId),
  ]);
  if (!student) {
    return <p className="text-sm text-red-500">学员不存在或无权访问</p>;
  }
  const count = await db.report.count({ where: { orgId: ctx.orgId } });

  return (
    <Editor
      student={student}
      data={DEFAULT_REPORT_DATA}
      reportId={undefined}
      refs={{ ...refs, reportNo: `GP-${count + 1}` }}
    />
  );
}
