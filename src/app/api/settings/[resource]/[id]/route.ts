import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";
import { RESOURCES } from "../route";

type RouteContext = { params: Promise<{ resource: string; id: string }> };

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const account = await requireOrg();
  if (!account) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { resource, id } = await ctx.params;
  const conf = RESOURCES[resource];
  if (!conf) return NextResponse.json({ error: "未知资源" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  for (const f of conf.fields) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  const delegate = db[conf.model] as PrismaClient["course"];
  const item = await delegate.update({ where: { id }, data: data as never });
  if (item.orgId !== account.orgId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const account = await requireOrg();
  if (!account) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { resource, id } = await ctx.params;
  const conf = RESOURCES[resource];
  if (!conf) return NextResponse.json({ error: "未知资源" }, { status: 404 });
  const delegate = db[conf.model] as PrismaClient["course"];
  const item = await delegate.findUnique({ where: { id } });
  if (!item || item.orgId !== account.orgId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  // 关键词分组删除时级联删除组内关键词
  if (resource === "groups") {
    await db.keyword.deleteMany({ where: { groupId: id } });
  }
  await delegate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
