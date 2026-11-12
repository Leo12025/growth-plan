import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatform } from "@/lib/auth";

/** 平台订单视角：已兑换的兑换码 + 次数流水 */
export async function GET() {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const [redeemed, logs] = await Promise.all([
    db.redeemCode.findMany({
      where: { status: "USED" },
      orderBy: { usedAt: "desc" },
      take: 100,
    }),
    db.quotaLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return NextResponse.json({ redeemed, logs });
}
