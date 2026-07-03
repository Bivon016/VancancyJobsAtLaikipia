import { CalendarDays, Clock3, UserRound } from 'lucide-react';
import Card from '../ui/Card';

export default function InterviewHeader({ title, subtitle, meta = [] }) {
  return (
    <Card className="mb-6 border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Interview workspace</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">{title}</h1>
          {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {meta.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                {item.icon === 'user' ? <UserRound className="h-3.5 w-3.5" /> : item.icon === 'calendar' ? <CalendarDays className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                {item.label}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
