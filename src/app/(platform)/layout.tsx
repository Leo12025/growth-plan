import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePlatform } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requirePlatform();
  if (!account) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link href="/platform/orgs" className="font-bold whitespace-nowrap">
            学生成长规划系统
            <span className="text-xs font-normal text-slate-400 ml-2">
              平台管理端
            </span>
          </Link>
          <nav className="flex gap-1 text-sm">
            {[
              ["/platform/orgs", "机构管理"],
              ["/platform/plans", "套餐配置"],
              ["/platform/codes", "兑换码"],
              ["/platform/orders", "订单流水"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm text-slate-300">
            <span>{account.username}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
