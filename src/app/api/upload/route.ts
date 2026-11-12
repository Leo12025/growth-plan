import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireOrg } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/** 图片上传：保存到 public/uploads，返回可直接访问的 URL */
export async function POST(req: NextRequest) {
  const ctx = await requireOrg();
  if (!ctx) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "未选择文件" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "仅支持 JPG / PNG / WebP / GIF 图片" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "图片不能超过 5MB" }, { status: 400 });
  }

  const ext = (file.type.split("/")[1] || "png").replace("jpeg", "jpg");
  const sub = new Date().toISOString().slice(0, 7); // YYYY-MM
  const dir = path.join(process.cwd(), "public", "uploads", sub);
  await mkdir(dir, { recursive: true });
  const name = `${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);

  return NextResponse.json({ url: `/uploads/${sub}/${name}` });
}
