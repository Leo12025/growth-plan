import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatform } from "@/lib/auth";

export async function GET() {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const list = await db.plan.findMany({ orderBy: { price: "asc" } });
  return NextResponse.json({ list });
}

export async function POST(req: NextRequest) {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.name || !b.times)
    return NextResponse.json({ error: "缺少套餐名称或次数" }, { status: 400 });
  const plan = await db.plan.create({
    data: {
      name: String(b.name),
      price: Number(b.price ?? 0),
      times: Number(b.times),
      validDays: Number(b.validDays ?? 365),
      active: b.active !== false,
    },
  });
  return NextResponse.json({ plan });
}
