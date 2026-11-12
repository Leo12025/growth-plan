import Link from "next/link";
import { requireOrg } from "@/lib/auth";
import { db } from "@/lib/db";
import ReportRowActions from "@/components/ReportRowActions";

export default async function ReportsPage() {
  const ctx = await requireOrg();
  if (!ctx) return null;
  const reports = await db.report.findMany({
    where: { orgId: ctx.orgId },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">报告列表</h1>
          <p className="text-sm text-slate-500 mt-1">
            学员成长规划报告，可继续编辑或导出 PDF
          </p>
        </div>
        <Link
          href="/reports/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2"
        >
          + 新建学员报告
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">
            还没有学员报告
          </h2>
          <p className="text-sm text-slate-500">
            先到
            <Link href="/students" className="text-indigo-600 hover:underline mx-1">
              学员管理
            </Link>
            建档，然后创建第一份成长规划报告
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {reports.map((r) => (
            <div key={r.id} className="px-6 py-4 flex items-center gap-4">
              <span className="text-xs text-slate-400 font-mono w-16 shrink-0">
                {r.no}
              </span>
              {r.student.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.student.avatar}
                  alt={r.student.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 text-sm flex items-center justify-center shrink-0">
                  {r.student.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-slate-700">
                  {r.student.name}
                </span>
                <span className="text-sm text-slate-400 ml-3">
                  {new Date(r.createdAt).toLocaleDateString("zh-CN")}
                </span>
                {r.lastExportAt && (
                  <span className="text-xs text-slate-400 ml-3">
                    已导出 PDF
                  </span>
                )}
              </div>
              <ReportRowActions reportId={r.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
