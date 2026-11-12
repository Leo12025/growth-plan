import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";

export async function GET() {
  const account = await requireOrg();
  if (!account) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const quota = await db.quotaAccount.findUnique({
    where: { orgId: account.orgId },
  });
  return NextResponse.json({ org: account.org, quota });
}

export async function PUT(req: NextRequest) {
  const account = await requireOrg();
  if (!account) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const org = await db.org.update({
    where: { id: account.orgId },
    data: {
      name: body.name ?? account.org.name,
      address: body.address ?? account.org.address,
      phone: body.phone ?? account.org.phone,
      logo: body.logo ?? account.org.logo,
    },
  });
  return NextResponse.json({ org });
}
