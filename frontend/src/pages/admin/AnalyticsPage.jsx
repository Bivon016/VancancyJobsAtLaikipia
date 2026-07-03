import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { interviewService } from '../../services/interviewService';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // backend does not expose a single analytics endpoint; use interviews as a basic source
        const { data } = await interviewService.getAll();
        setStats({ total: Array.isArray(data) ? data.length : 0 });
      } catch (err) {
        setError('Unable to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) return <div className="mx-auto max-w-6xl"><div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></div>;

  return (
    <div className="mx-auto max-w-6xl">
      <Card>
        <CardHeader title="Online interview analytics" subtitle="High level statistics and charts" />
        {stats ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Total interviews</p>
              <p className="mt-2 text-2xl font-bold text-primary">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Submitted</p>
              <p className="mt-2 text-2xl font-bold text-primary">—</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Evaluated</p>
              <p className="mt-2 text-2xl font-bold text-primary">—</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Average score</p>
              <p className="mt-2 text-2xl font-bold text-primary">—</p>
            </div>
          </div>
        ) : (
          <EmptyState title="No analytics" description="No data available." />
        )}
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </Card>
    </div>
  );
}
