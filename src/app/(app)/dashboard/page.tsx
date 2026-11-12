import Link from "next/link";
import { requireOrg } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const account = await requireOrg();
  if (!account) return null;
  const reports = await db.report.findMany({
    where: { orgId: account.orgId },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">工作台</h1>
          <p className="text-sm text-slate-500 mt-1">
            为学员创建成长规划报告，导出 PDF 发送给家长
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
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            报告编辑器开发中（M2）。建议先到
            <Link
              href="/settings/brand"
              className="text-indigo-600 hover:underline mx-1"
            >
              机构设置
            </Link>
            检查品牌信息、老师团队、课程体系等基础数据。
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {reports.map((r) => (
            <div key={r.id} className="px-6 py-4 flex items-center gap-4">
              <span className="text-xs text-slate-400 font-mono w-16">
                {r.no}
              </span>
              <span className="font-medium text-slate-700">
                {r.student.name}
              </span>
              <span className="text-sm text-slate-400">
                {new Date(r.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
