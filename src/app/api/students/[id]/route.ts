import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = await requireOrg();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await db.student.findUnique({ where: { id } });
  if (!existing || existing.orgId !== auth.orgId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  const b = await req.json().catch(() => ({}));
  const student = await db.student.update({
    where: { id },
    data: {
      name: b.name !== undefined ? String(b.name) : undefined,
      avatar: b.avatar !== undefined ? String(b.avatar) : undefined,
      age: b.age !== undefined ? (b.age ? Number(b.age) : null) : undefined,
      grade: b.grade !== undefined ? String(b.grade) : undefined,
      school: b.school !== undefined ? String(b.school) : undefined,
      campusId: b.campusId !== undefined ? b.campusId || null : undefined,
      teacherId: b.teacherId !== undefined ? b.teacherId || null : undefined,
      tags: b.tags !== undefined ? JSON.stringify(b.tags.slice(0, 5)) : undefined,
      photos:
        b.photos !== undefined ? JSON.stringify(b.photos.slice(0, 6)) : undefined,
    },
  });
  return NextResponse.json({ student });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireOrg();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await db.student.findUnique({ where: { id } });
  if (!existing || existing.orgId !== auth.orgId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  await db.report.deleteMany({ where: { studentId: id } });
  await db.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
