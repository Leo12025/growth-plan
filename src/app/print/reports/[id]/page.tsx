import { requireOrg } from "@/lib/auth";
import { loadEditorRefs, loadReport, loadStudent } from "@/lib/editor-data";
import Preview, { PreviewRefs } from "@/components/report/Preview";

/** 报告打印页（供服务端无头浏览器渲染 PDF，样式即家长收到的效果） */
export default async function PrintReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await requireOrg();
  if (!ctx) return <p>无权访问</p>;
  const { id } = await params;
  const loaded = await loadReport(ctx.orgId, id);
  if (!loaded) return <p>报告不存在</p>;
  const [refs, student] = await Promise.all([
    loadEditorRefs(ctx.orgId),
    loadStudent(ctx.orgId, loaded.report.studentId),
  ]);
  if (!student) return <p>学员不存在</p>;

  const previewRefs: PreviewRefs = {
    org: refs.org,
    reportNo: loaded.report.no,
    student: {
      name: student.name,
      avatar: student.avatar,
      age: student.age,
      grade: student.grade,
      school: student.school,
      campus: refs.campuses.find((c) => c.id === student.campusId)?.name ?? "",
      teacher:
        refs.teachers.find((t) => t.id === student.teacherId)?.name ?? "",
      tags: student.tags
        .map((tid) => refs.tags.find((t) => t.id === tid)?.name)
        .filter(Boolean) as string[],
      photos: student.photos,
    },
    groups: refs.groups,
    courses: refs.courses,
    contests: refs.contests,
    data: loaded.data,
  };

  return (
    <div className="print-page">
      <style>{`
        body { margin: 0; background: #fff; }
        .print-page { display: flex; justify-content: center; padding: 0; }
      `}</style>
      <Preview refs={previewRefs} />
    </div>
  );
}
