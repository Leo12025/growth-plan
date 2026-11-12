import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatform } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  const plan = await db.plan.update({
    where: { id },
    data: {
      name: b.name !== undefined ? String(b.name) : undefined,
      price: b.price !== undefined ? Number(b.price) : undefined,
      times: b.times !== undefined ? Number(b.times) : undefined,
      validDays: b.validDays !== undefined ? Number(b.validDays) : undefined,
      active: b.active !== undefined ? Boolean(b.active) : undefined,
    },
  });
  return NextResponse.json({ plan });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  await db.plan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
