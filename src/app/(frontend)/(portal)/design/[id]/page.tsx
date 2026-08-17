import { notFound } from "next/navigation";
import { DesignFeedbackForm } from "./DesignFeedbackForm";
import Link from "next/link";
import { ArrowRight, PenTool, FileImage, MessageSquare, CheckCircle } from "lucide-react";
import { requireUser, isStaff } from "@/lib/auth";
import { relationId } from "@/lib/relations";

export const dynamic = "force-dynamic";

export default async function DesignProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, { payload, user }] = await Promise.all([params, requireUser()]);

  const project = await payload
    .findByID({
      collection: "design-projects",
      id,
      depth: 2, // Get package, briefs, artworks
    })
    .catch(() => null);

  if (!project) notFound();

  // Only the owning customer, the assigned designer, or staff may view it.
  const isOwner = relationId(project.customer) === user.id;
  const isDesigner = project.designer ? relationId(project.designer) === user.id : false;
  if (!isStaff(user) && !isOwner && !isDesigner) {
    notFound();
  }

  const isAwaitingFeedback = project.status === 'awaiting_feedback';

  return (
    <div className="space-y-8 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/design" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-200 transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              پروژه طراحی #{project.id.toString().slice(0, 8)}
              <span className="px-3 py-1 bg-primary-50 text-primary-600 text-sm font-bold rounded-full">
                {project.status === 'brief_submitted' && 'در انتظار طراح'}
                {project.status === 'in_design' && 'در حال طراحی'}
                {project.status === 'awaiting_feedback' && 'نیازمند بررسی شما'}
                {project.status === 'revision' && 'در حال اصلاح'}
                {project.status === 'final_approval' && 'تأیید نهایی'}
                {project.status === 'delivered' && 'تحویل داده شده'}
              </span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              پکیج: {typeof project.package === 'object' ? project.package.name : "پکیج طراحی"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Rounds / Drafts */}
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PenTool size={24} className="text-primary-500" />
            اتودها و روند کار
          </h2>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {project.rounds && project.rounds.length > 0 ? (
              project.rounds.map((round: any, index: number) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 group-[.is-active]:bg-primary-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {index + 1}
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-2">راند {index + 1}</h3>
                    
                    {round.files && round.files.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {round.files.map((file: any) => (
                          <div key={typeof file === 'object' ? file.id : file} className="relative aspect-video bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center">
                            {typeof file === 'object' && file.url ? (
                              <img src={file.url} alt="اتود" className="object-cover w-full h-full" />
                            ) : (
                              <FileImage className="text-slate-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {round.feedback && (
                      <div className="mt-4 p-4 bg-amber-50 text-amber-800 text-sm rounded-xl border border-amber-100 flex gap-2">
                        <MessageSquare size={16} className="shrink-0 mt-0.5" />
                        <p>{round.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">طراح هنوز اتودی آپلود نکرده است.</p>
              </div>
            )}
          </div>

          {/* Action Area */}
          {isAwaitingFeedback && (
            <DesignFeedbackForm projectId={project.id.toString()} />
          )}
          
          {project.status === 'final_approval' && (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-6 mt-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900">طرح نهایی تأیید شده است</h3>
                <p className="text-green-800 text-sm mt-1">این فایل مستقیماً برای واحد چاپ ارسال شده است.</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">جزئیات بریف</h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>تعداد اصلاح رایگان:</span>
                <span className="font-bold text-slate-800">{typeof project.package === 'object' ? project.package.revisions : '-'} راند</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>زمان تحویل:</span>
                <span className="font-bold text-slate-800">{typeof project.package === 'object' ? project.package.deliveryTime : '-'} روز کاری</span>
              </div>
              {project.brief && (
                <div className="pt-2">
                  <span className="block mb-2 font-bold text-slate-700">توضیحات شما:</span>
                  <p className="bg-slate-50 p-3 rounded-xl whitespace-pre-wrap">{JSON.stringify(project.brief, null, 2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
