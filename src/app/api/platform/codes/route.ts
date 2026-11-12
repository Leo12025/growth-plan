import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { requirePlatform } from "@/lib/auth";

function genCode() {
  const raw = crypto.randomBytes(8).toString("hex").toUpperCase();
  return `GP${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export async function GET() {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const list = await db.redeemCode.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ list });
}

/** 批量生成兑换码 */
export async function POST(req: NextRequest) {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const count = Math.min(Math.max(Number(b.count ?? 1), 1), 100);
  const planId = b.planId ? String(b.planId) : null;
  const plan = planId ? await db.plan.findUnique({ where: { id: planId } }) : null;
  const times = Number(b.times ?? plan?.times ?? 0);
  if (!times) return NextResponse.json({ error: "请指定次数" }, { status: 400 });

  const days = Number(b.validDays ?? plan?.validDays ?? 365);
  const expiresAt = days > 0 ? new Date(Date.now() + days * 86400000) : null;

  const data = Array.from({ length: count }).map(() => ({
    code: genCode(),
    planId: plan?.id ?? null,
    planName: plan?.name ?? "自定义",
    times,
    expiresAt,
  }));

  await db.redeemCode.createMany({ data });
  const list = await db.redeemCode.findMany({
    where: { code: { in: data.map((d) => d.code) } },
  });
  return NextResponse.json({ list });
}
