import { requireOrg } from "@/lib/auth";
import SettingsNav from "@/components/SettingsNav";
import BrandForm from "@/components/BrandForm";
import GenericManager, { Field } from "@/components/GenericManager";
import KeywordsManager from "@/components/KeywordsManager";
import QuotaPanel from "@/components/QuotaPanel";
import { notFound } from "next/navigation";

export default async function SettingsTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const account = await requireOrg();
  if (!account) return null;
  const { tab } = await params;

  let content: React.ReactNode;
  switch (tab) {
    case "brand":
      content = <BrandForm org={account.org} />;
      break;
    case "teachers":
      content = (
        <GenericManager
          resource="teachers"
          title="老师团队"
          description="维护规划/指导老师名单，学员报告中可直接选用"
          fields={[
            { key: "name", label: "老师姓名" },
            { key: "title", label: "职务/头衔" },
          ]}
          columns={[
            { key: "name", label: "姓名" },
            { key: "title", label: "职务/头衔" },
          ]}
        />
      );
      break;
    case "courses":
      content = (
        <GenericManager
          resource="courses"
          title="课程体系"
          description="学员报告「入学课程规划」选择课程后，简介自动带出"
          fields={[
            { key: "name", label: "课程名称" },
            { key: "intro", label: "能力定位 / 学习价值", type: "textarea" },
          ]}
          columns={[
            { key: "name", label: "课程名称" },
            { key: "intro", label: "简介" },
          ]}
        />
      );
      break;
    case "tags":
      content = (
        <GenericManager
          resource="tags"
          title="学员标签"
          description="学员信息中最多可选择 5 个标签"
          fields={[{ key: "name", label: "标签名称" }]}
          columns={[{ key: "name", label: "标签" }]}
        />
      );
      break;
    case "keywords":
      content = <KeywordsManager />;
      break;
    case "contests":
      content = (
        <GenericManager
          resource="contests"
          title="赛事考级"
          description="内置 23 项赛事考级，可按需增删"
          fields={[
            { key: "name", label: "名称" },
            {
              key: "type",
              label: "类型",
              type: "select",
              options: ["赛事", "考级"],
            },
            { key: "intro", label: "说明", type: "textarea" },
          ]}
          columns={[
            { key: "name", label: "名称" },
            { key: "type", label: "类型" },
            { key: "intro", label: "说明" },
          ]}
        />
      );
      break;
    case "comments":
      content = (
        <GenericManager
          resource="comments"
          title="评语模板"
          description="教师寄语可直接引用模板或自由编辑"
          fields={[
            { key: "category", label: "类型（如：综合优秀型）" },
            { key: "title", label: "标题" },
            { key: "content", label: "评语内容", type: "textarea" },
          ]}
          columns={[
            { key: "category", label: "类型" },
            { key: "content", label: "内容" },
          ]}
        />
      );
      break;
    case "schedules":
      content = (
        <GenericManager
          resource="schedules"
          title="机构赛事日程"
          description="维护全年赛事日程，学员侧可标记参与/报名/获奖"
          fields={[
            { key: "name", label: "赛事名称" },
            { key: "date", label: "比赛日期", type: "date" },
            { key: "signupAt", label: "报名截止", type: "date" },
            { key: "location", label: "地点" },
          ]}
          columns={[
            { key: "name", label: "赛事" },
            { key: "date", label: "比赛日期" },
            { key: "signupAt", label: "报名截止" },
            { key: "location", label: "地点" },
          ]}
        />
      );
      break;
    case "achievements":
      content = (
        <GenericManager
          resource="achievements"
          title="学习成果库"
          description="机构预置成果，报告中也可自由填写"
          fields={[
            { key: "name", label: "成果名称" },
            {
              key: "type",
              label: "类型",
              type: "select",
              options: ["奖章", "等级", "目标"],
            },
          ]}
          columns={[
            { key: "name", label: "名称" },
            { key: "type", label: "类型" },
          ]}
        />
      );
      break;
    case "quota":
      content = <QuotaPanel />;
      break;
    default:
      notFound();
  }

  return (
    <div className="flex gap-6">
      <SettingsNav />
      <div className="flex-1 min-w-0">{content}</div>
    </div>
  );
}
