import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";

export async function GET() {
  const ctx = await requireOrg();
  if (!ctx) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const list = await db.student.findMany({
    where: { orgId: ctx.orgId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ list });
}

export async function POST(req: NextRequest) {
  const ctx = await requireOrg();
  if (!ctx) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.name) return NextResponse.json({ error: "请填写学员姓名" }, { status: 400 });
  const student = await db.student.create({
    data: {
      orgId: ctx.orgId,
      name: String(b.name),
      avatar: String(b.avatar ?? ""),
      age: b.age ? Number(b.age) : null,
      grade: String(b.grade ?? ""),
      school: String(b.school ?? ""),
      campusId: b.campusId || null,
      teacherId: b.teacherId || null,
      tags: JSON.stringify((b.tags ?? []).slice(0, 5)),
      photos: JSON.stringify((b.photos ?? []).slice(0, 6)),
    },
  });
  return NextResponse.json({ student });
}
