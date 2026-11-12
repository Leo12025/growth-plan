import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";

/** 机构兑换兑换码：一次性使用，次数入账并写流水 */
export async function POST(req: NextRequest) {
  const ctx = await requireOrg();
  if (!ctx) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { code } = (await req.json().catch(() => ({}))) ?? {};
  if (!code) return NextResponse.json({ error: "请输入兑换码" }, { status: 400 });

  const rc = await db.redeemCode.findUnique({
    where: { code: String(code).trim().toUpperCase() },
  });
  if (!rc) return NextResponse.json({ error: "兑换码不存在" }, { status: 400 });
  if (rc.status === "VOID")
    return NextResponse.json({ error: "兑换码已作废" }, { status: 400 });
  if (rc.status === "USED")
    return NextResponse.json({ error: "兑换码已被使用" }, { status: 400 });
  if (rc.expiresAt && rc.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "兑换码已过期" }, { status: 400 });
  }

  const org = await db.org.findUnique({ where: { id: ctx.orgId } });
  await db.$transaction([
    db.redeemCode.update({
      where: { id: rc.id },
      data: {
        status: "USED",
        orgId: ctx.orgId,
        orgName: org?.name ?? "",
        usedAt: new Date(),
      },
    }),
    db.quotaAccount.upsert({
      where: { orgId: ctx.orgId },
      update: { balance: { increment: rc.times } },
      create: { orgId: ctx.orgId, balance: rc.times },
    }),
    db.quotaLog.create({
      data: {
        orgId: ctx.orgId,
        delta: rc.times,
        reason: `兑换充值（${rc.planName || "自定义"}）`,
        refId: rc.id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, times: rc.times });
}
