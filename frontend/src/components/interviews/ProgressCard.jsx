export default function ProgressCard({ scored, total, percent }) {
  return (
    <div className="mb-6 rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Evaluation progress</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-primary">Questions scored</h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{scored}/{total}</p>
          <p className="text-sm text-muted">{percent}% complete</p>
        </div>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  );
}
