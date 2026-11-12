import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatform } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

/** 作废兑换码（已使用的不可作废） */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  const rc = await db.redeemCode.findUnique({ where: { id } });
  if (!rc) return NextResponse.json({ error: "不存在" }, { status: 404 });
  if (rc.status === "USED")
    return NextResponse.json({ error: "已使用的兑换码不可作废" }, { status: 400 });
  await db.redeemCode.update({ where: { id }, data: { status: "VOID" } });
  return NextResponse.json({ ok: true });
}
