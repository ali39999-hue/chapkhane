import Link from "next/link";
import { PenTool, MessageSquare } from "lucide-react";
import { isStaff, requireUser } from "@/lib/auth";
import type { Where } from "payload";

export const dynamic = "force-dynamic";

export default async function DesignProjectsPage() {
  const { payload, user } = await requireUser();

  // Customers see their own projects; designers see the ones assigned to them;
  // staff see everything.
  let where: Where = {};
  if (user.role === 'designer') {
    where = { designer: { equals: user.id } };
  } else if (!isStaff(user)) {
    where = { customer: { equals: user.id } };
  }

  // The table renders four fields. `depth: 1` without `select` populated
  // `customer`, `designer`, `orderItem`, `deliverables` and every
  // `rounds[].files` relationship just to read one package name.
  const projects = await payload.find({
    collection: "design-projects",
    where,
    sort: "-createdAt",
    limit: 50,
    depth: 1,
    pagination: false,
    select: {
      package: true,
      createdAt: true,
      status: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">خدمات طراحی</h1>
          <p className="text-slate-500 mt-2 font-medium">پیگیری وضعیت پروژه‌های طراحی و بررسی اتودها</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-2xl border border-slate-100/80 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.03)] overflow-hidden">
        {projects.docs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100/80">
                <tr>
                  <th className="px-6 py-4">شناسه پروژه</th>
                  <th className="px-6 py-4">پکیج طراحی</th>
                  <th className="px-6 py-4">تاریخ ثبت</th>
                  <th className="px-6 py-4">وضعیت</th>
                  <th className="px-6 py-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {projects.docs.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 font-bold text-slate-800">
                      #{project.id.toString().slice(0, 8)}
                    </td>
                    <td className="px-6 py-5 text-slate-600 font-medium">
                      {typeof project.package === 'object' && project.package !== null
                        ? project.package.name
                        : "پکیج طراحی"}
                    </td>
                    <td className="px-6 py-5 text-slate-500">
                      {new Date(project.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                        {project.status === 'brief_submitted' && 'در انتظار طراح'}
                        {project.status === 'in_design' && 'در حال طراحی'}
                        {project.status === 'awaiting_feedback' && 'نیازمند بررسی شما'}
                        {project.status === 'revision' && 'در حال اصلاح'}
                        {project.status === 'final_approval' && 'تأیید نهایی'}
                        {project.status === 'delivered' && 'تحویل داده شده'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/design/${project.id}`}
                          className="flex items-center gap-1 px-3 py-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl font-bold transition-colors"
                        >
                          <MessageSquare size={16} />
                          {project.status === 'awaiting_feedback' ? 'بررسی اتود' : 'مشاهده'}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500">
            <PenTool size={48} className="mb-4 text-slate-300" />
            <p className="text-lg font-medium">پروژه طراحی در جریان ندارید.</p>
            <p className="text-sm">در هنگام ثبت سفارش چاپی می‌توانید گزینه خدمات طراحی را انتخاب کنید.</p>
          </div>
        )}
      </div>
    </div>
  );
}
