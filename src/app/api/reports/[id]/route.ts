import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireOrg();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  const report = await db.report.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!report || report.orgId !== auth.orgId) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }
  return NextResponse.json({ report });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = await requireOrg();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await db.report.findUnique({ where: { id } });
  if (!existing || existing.orgId !== auth.orgId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  const b = await req.json().catch(() => ({}));
  const report = await db.report.update({
    where: { id },
    data: {
      data: b.data !== undefined ? JSON.stringify(b.data) : undefined,
      title: b.title !== undefined ? String(b.title) : undefined,
    },
  });
  return NextResponse.json({ report });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireOrg();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await db.report.findUnique({ where: { id } });
  if (!existing || existing.orgId !== auth.orgId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  await db.report.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
