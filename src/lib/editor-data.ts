import { db } from "@/lib/db";
import { parseReportData, ReportData } from "@/lib/report";

export async function loadEditorRefs(orgId: string) {
  const [org, campuses, teachers, tags, groups, keywords, courses, contests, comments, achievementPresets, schedules] =
    await Promise.all([
      db.org.findUnique({ where: { id: orgId } }),
      db.campus.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } }),
      db.teacher.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } }),
      db.studentTag.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } }),
      db.keywordGroup.findMany({ where: { orgId }, orderBy: { sortOrder: "asc" } }),
      db.keyword.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } }),
      db.course.findMany({ where: { orgId }, orderBy: { sortOrder: "asc" } }),
      db.contest.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } }),
      db.commentTemplate.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } }),
      db.achievementPreset.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } }),
      db.contestSchedule.findMany({ where: { orgId }, orderBy: { createdAt: "asc" } }),
    ]);

  return {
    org: { name: org?.name ?? "", logo: org?.logo ?? "" },
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      keywords: keywords
        .filter((k) => k.groupId === g.id)
        .map((k) => ({ id: k.id, name: k.content })),
    })),
    courses: courses.map((c) => ({ id: c.id, name: c.name, intro: c.intro })),
    contests: contests.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      intro: c.intro,
    })),
    comments: comments.map((c) => ({
      id: c.id,
      category: c.category,
      title: c.title,
      content: c.content,
    })),
    tags: tags.map((t) => ({ id: t.id, name: t.name })),
    campuses: campuses.map((c) => ({ id: c.id, name: c.name })),
    teachers: teachers.map((t) => ({ id: t.id, name: t.name })),
    achievementPresets: achievementPresets.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
    })),
    schedules: schedules.map((s) => ({ id: s.id, name: s.name, date: s.date })),
  };
}

export async function loadStudent(orgId: string, studentId: string) {
  const s = await db.student.findUnique({ where: { id: studentId } });
  if (!s || s.orgId !== orgId) return null;
  return {
    id: s.id,
    name: s.name,
    avatar: s.avatar,
    age: s.age,
    grade: s.grade,
    school: s.school,
    campusId: s.campusId ?? "",
    teacherId: s.teacherId ?? "",
    tags: JSON.parse(s.tags || "[]") as string[],
    photos: JSON.parse(s.photos || "[]") as string[],
  };
}

export async function loadReport(orgId: string, reportId: string) {
  const r = await db.report.findUnique({ where: { id: reportId } });
  if (!r || r.orgId !== orgId) return null;
  return { report: r, data: parseReportData(r.data) as ReportData };
}
