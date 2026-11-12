import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";

export async function GET() {
  const ctx = await requireOrg();
  if (!ctx) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const [quota, logs, plans] = await Promise.all([
    db.quotaAccount.findUnique({ where: { orgId: ctx.orgId } }),
    db.quotaLog.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.plan.findMany({ where: { active: true }, orderBy: { price: "asc" } }),
  ]);
  return NextResponse.json({ balance: quota?.balance ?? 0, logs, plans });
}
