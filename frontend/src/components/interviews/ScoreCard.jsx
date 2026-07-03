import { CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { Textarea } from '../ui/Input';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function ScoreCard({
  question,
  answer,
  score,
  onScoreChange,
  onCommentChange,
  onRecommendationChange,
  onSave,
  saving,
  saved,
  maxMarks,
  index,
  isReadOnly,
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Question {index}</p>
          <h3 className="mt-2 font-heading text-lg font-bold text-primary">{question?.questionTitle || question?.title || 'Untitled question'}</h3>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Max {maxMarks ?? 0} marks
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Applicant answer</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{answer || 'No answer provided.'}</p>
        </div>
        <div className="space-y-4">
          <Input
            label="Marks awarded"
            type="number"
            min="0"
            max={maxMarks ?? 0}
            value={score?.marksAwarded ?? ''}
            onChange={(event) => onScoreChange(event.target.value)}
            disabled={isReadOnly}
          />
          <Textarea
            label="Comment"
            value={score?.comment ?? ''}
            onChange={(event) => onCommentChange(event.target.value)}
            disabled={isReadOnly}
          />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(score?.recommended)}
              onChange={(event) => onRecommendationChange(event.target.checked)}
              disabled={isReadOnly}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            Recommend this candidate
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          {saved ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <MessageSquareQuote className="h-4 w-4" />}
          {saved ? 'Updated' : 'Pending'}
        </div>
        <Button variant="primary" size="sm" onClick={onSave} loading={saving} disabled={isReadOnly || saving}>
          {saving ? 'Saving…' : saved ? 'Updated' : 'Save Score'}
        </Button>
      </div>
    </div>
  );
}
