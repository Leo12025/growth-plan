import { NextRequest, NextResponse } from "next/server";
import { chromium, type Browser } from "playwright";
import { db } from "@/lib/db";
import { requireOrg } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

const EXPORT_WINDOW_MS = 30 * 60 * 1000; // 30 分钟免扣次窗口

// 浏览器实例全局复用，避免每次导出冷启动
const globalForPlaywright = globalThis as unknown as { pwBrowser?: Browser };
async function getBrowser() {
  if (!globalForPlaywright.pwBrowser?.isConnected()) {
    globalForPlaywright.pwBrowser = await chromium.launch();
  }
  return globalForPlaywright.pwBrowser;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await requireOrg();
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await ctx.params;
  const report = await db.report.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!report || report.orgId !== auth.orgId) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  // 扣次判断：同一报告 30 分钟内重复导出不扣次
  const withinWindow =
    report.lastExportAt &&
    Date.now() - report.lastExportAt.getTime() < EXPORT_WINDOW_MS;

  // 无头浏览器渲染打印页 → PDF（渲染成功后才扣次）
  let pdf: Uint8Array;
  try {
    const browser = await getBrowser();
    const context = await browser.newContext();
    const session = req.cookies.get("gp_session")?.value;
    if (session) {
      await context.addCookies([
        {
          name: "gp_session",
          value: session,
          url: req.nextUrl.origin,
        },
      ]);
    }
    const page = await context.newPage();
    await page.goto(`${req.nextUrl.origin}/print/reports/${id}`, {
      waitUntil: "load",
      timeout: 60000,
    });
    // 等待报告主体渲染完成
    await page.waitForSelector(".print-page", { timeout: 15000 });
    // 等待所有图片加载完毕（头像/照片/Logo）
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              })
          )
      )
    );
    pdf = new Uint8Array(
      await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" },
      })
    );
    await context.close();
  } catch (e) {
    console.error("PDF export failed:", e);
    return NextResponse.json({ error: "PDF 生成失败，请重试" }, { status: 500 });
  }

  let charged = false;
  if (!withinWindow) {
    const quota = await db.quotaAccount.findUnique({
      where: { orgId: auth.orgId },
    });
    if (!quota || quota.balance <= 0) {
      return NextResponse.json(
        { error: "剩余次数不足，请先兑换套餐", code: "NO_QUOTA" },
        { status: 402 }
      );
    }
    await db.$transaction([
      db.quotaAccount.update({
        where: { orgId: auth.orgId },
        data: { balance: { decrement: 1 } },
      }),
      db.quotaLog.create({
        data: { orgId: auth.orgId, delta: -1, reason: "导出扣次", refId: id },
      }),
    ]);
    charged = true;
  }
  await db.report.update({
    where: { id },
    data: { lastExportAt: new Date() },
  });

  const filename = encodeURIComponent(
    `${report.no}-${report.student.name}-成长规划报告.pdf`
  );
  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "X-Charged": String(charged),
    },
  });
}
