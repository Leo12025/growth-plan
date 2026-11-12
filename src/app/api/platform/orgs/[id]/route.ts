import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requirePlatform } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

/** 调整机构次数（充值/扣减） */
export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requirePlatform()))
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));

  if (b.action === "quota") {
    const delta = Number(b.delta);
    if (!delta) return NextResponse.json({ error: "次数无效" }, { status: 400 });
    await db.$transaction([
      db.quotaAccount.upsert({
        where: { orgId: id },
        update: { balance: { increment: delta } },
        create: { orgId: id, balance: Math.max(delta, 0) },
      }),
      db.quotaLog.create({
        data: {
          orgId: id,
          delta,
          reason: String(b.reason ?? "平台调整"),
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (b.action === "password") {
    if (!b.password || String(b.password).length < 6)
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    const account = await db.account.findFirst({ where: { orgId: id } });
    if (!account)
      return NextResponse.json({ error: "机构账号不存在" }, { status: 404 });
    await db.account.update({
      where: { id: account.id },
      data: { passwordHash: await bcrypt.hash(String(b.password), 10) },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}
