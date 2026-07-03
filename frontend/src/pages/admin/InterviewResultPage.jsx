import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Select, Textarea } from '../../components/ui/Input';
import InterviewHeader from '../../components/interviews/InterviewHeader';
import ResultSummary from '../../components/interviews/ResultSummary';
import ConfirmModal from '../../components/interviews/ConfirmModal';
import { interviewService } from '../../services/interviewService';
import { resultService } from '../../services/resultService';
import { formatDateTime } from '../../utils/constants';

export default function InterviewResultPage() {
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState({ recommendation: '', panelRemarks: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const interviewId = params.get('interviewId');
    if (!interviewId) {
      setError('No interview selected.');
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const [interviewResult, resultResult] = await Promise.all([
          interviewService.getById(interviewId),
          resultService.getResult(interviewId).catch(() => null),
        ]);
        setInterview(interviewResult.data);
        setResult(resultResult?.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load interview result.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleFinalize = async () => {
    const params = new URLSearchParams(window.location.search);
    const interviewId = params.get('interviewId');
    try {
      setSubmitting(true);
      const { data } = await resultService.finalize(interviewId, { recommendation: form.recommendation, panelRemarks: form.panelRemarks });
      setResult(data);
      setConfirmOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to finalize interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const recommendationLabel = useMemo(() => {
    if (!result?.recommendation) return 'Pending';
    return result.recommendation;
  }, [result]);

  if (loading) {
    return (<div className="mx-auto flex max-w-6xl justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <InterviewHeader title="Interview result" subtitle="Review the completed interview outcome and finalize the recommendation if needed." meta={[{ label: 'Applicant', value: interview?.applicantName || '—', icon: 'user' }, { label: 'Vacancy', value: interview?.vacancyTitle || '—', icon: 'calendar' }, { label: 'Status', value: interview?.status || 'SCHEDULED', icon: 'clock' }]} />

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {result ? (
        <ResultSummary result={result} interview={interview} />
      ) : (
        <Card className="mb-6 border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Interview outcome</p>
          <p className="mt-2 text-sm leading-6 text-muted">This interview has not been finalized yet. You can record the final recommendation and remarks below.</p>
        </Card>
      )}

      <Card className="mt-6 border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
        <CardHeader title="Interview summary" subtitle="A concise view of the interview record." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Interview date</p><p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(interview?.createdAt)}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Total score</p><p className="mt-2 text-sm font-semibold text-slate-900">{result?.totalScore ?? '—'}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Average</p><p className="mt-2 text-sm font-semibold text-slate-900">{result?.averageScore ?? '—'}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Recommendation</p><p className="mt-2 text-sm font-semibold text-slate-900">{recommendationLabel}</p></div>
        </div>
      </Card>

      <Card className="mt-6 border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
        <CardHeader title="Finalize interview" subtitle="Set the final recommendation and panel remarks." />
        <div className="space-y-4">
          <Select label="Recommendation" value={form.recommendation} onChange={(event) => setForm({ ...form, recommendation: event.target.value })}>
            <option value="">Select recommendation</option>
            <option value="SHORTLIST">Shortlist</option>
            <option value="RESERVE">Reserve</option>
            <option value="REJECT">Reject</option>
          </Select>
          <Textarea label="Panel remarks" value={form.panelRemarks} onChange={(event) => setForm({ ...form, panelRemarks: event.target.value })} placeholder="Add final remarks for the panel record." />
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={!form.recommendation || submitting}>
              <Sparkles className="h-4 w-4" />
              Finalize Interview
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/interviews')}>
              <FileText className="h-4 w-4" />
              Back to interviews
            </Button>
          </div>
        </div>
      </Card>

      {confirmOpen && (
        <ConfirmModal title="Finalize interview" description="This will lock the final recommendation and remarks for the candidate." onCancel={() => setConfirmOpen(false)} onConfirm={handleFinalize} confirmLabel="Finalize" loading={submitting} />
      )}
    </div>
  );
}
