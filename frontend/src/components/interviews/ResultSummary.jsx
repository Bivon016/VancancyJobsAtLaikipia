import { CheckCircle2, MessageSquareText, UserRound } from 'lucide-react';
import Card from '../ui/Card';

export default function ResultSummary({ result, interview }) {
  return (
    <Card className="border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <UserRound className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Applicant</p>
              <p className="font-semibold text-slate-900">{result?.applicantName || interview?.applicantName || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <MessageSquareText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Vacancy</p>
              <p className="font-semibold text-slate-900">{result?.vacancyTitle || interview?.vacancyTitle || '—'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Overall score</p>
          <p className="mt-3 text-4xl font-bold text-primary">{result?.totalScore ?? 0}</p>
          <p className="mt-1 text-sm text-muted">Average {result?.averageScore ?? 0}%</p>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {result?.recommendation || 'Pending'}
          </div>
        </div>
      </div>
    </Card>
  );
}
