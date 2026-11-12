import Link from "next/link";
import { requireOrg } from "@/lib/auth";
import { db } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requireOrg();
  if (!account) return null;
  const quota = await db.quotaAccount.findUnique({
    where: { orgId: account.orgId },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link
            href="/dashboard"
            className="font-bold text-indigo-700 whitespace-nowrap"
          >
            学生成长规划系统
          </Link>
          <nav className="flex gap-1 text-sm">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600"
            >
              工作台
            </Link>
            <Link
              href="/students"
              className="px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600"
            >
              学员管理
            </Link>
            <Link
              href="/reports"
              className="px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600"
            >
              报告列表
            </Link>
            <Link
              href="/settings/brand"
              className="px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600"
            >
              机构设置
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="text-slate-500">
              剩余次数：
              <span className="font-semibold text-indigo-700">
                {quota?.balance ?? 0}
              </span>
            </span>
            <span className="text-slate-700">{account.org.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
