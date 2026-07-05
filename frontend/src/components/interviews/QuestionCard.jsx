import { CheckCircle2, Clock3, MessageSquareQuote } from 'lucide-react';
import { Textarea } from '../ui/Input';
import Button from '../ui/Button';

const OPTION_TYPES = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CHECKBOX'];

// Selected option(s) are stored as answerText: a single option id for
// MULTIPLE_CHOICE/TRUE_FALSE, or a comma-separated list of option ids
// for CHECKBOX (since answerText is a single string column on the backend).
function parseSelectedIds(answer) {
  if (!answer) return [];
  return String(answer).split(',').map((s) => s.trim()).filter(Boolean);
}

export default function QuestionCard({
  question,
  answer,
  onAnswerChange,
  onSave,
  saving,
  saved,
  lastSavedAt,
  isReadOnly,
  maxMarks,
  index,
}) {
  const questionType = question?.questionType;
  const isOptionBased = OPTION_TYPES.includes(questionType);
  const options = question?.options || [];
  const selectedIds = parseSelectedIds(answer);

  const handleSingleSelect = (optionId) => {
    onAnswerChange(String(optionId));
  };

  const handleMultiSelect = (optionId) => {
    const id = String(optionId);
    const next = selectedIds.includes(id)
      ? selectedIds.filter((existing) => existing !== id)
      : [...selectedIds, id];
    onAnswerChange(next.join(','));
  };

  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Question {index}</p>
          <h3 className="mt-2 font-heading text-lg font-bold text-primary">Question {index}</h3>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <MessageSquareQuote className="h-3.5 w-3.5" />
          Max {maxMarks ?? question?.marks ?? 0} marks
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-sm leading-7 text-slate-700">{question?.questionText || 'No prompt provided.'}</p>

        {isOptionBased ? (
          <div className="space-y-2">
            {options.length === 0 && (
              <p className="text-sm text-amber-700">
                This question has no options configured. Contact HR — it may need to be fixed in the question bank.
              </p>
            )}
            {options.map((option) => {
              const id = String(option.id);
              const checked = questionType === 'CHECKBOX' ? selectedIds.includes(id) : selectedIds[0] === id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                    checked ? 'border-primary bg-primary/5' : 'border-slate-200'
                  } ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'hover:border-primary/50'}`}
                >
                  <input
                    type={questionType === 'CHECKBOX' ? 'checkbox' : 'radio'}
                    name={`question-${question?.questionSetItemId}`}
                    checked={checked}
                    disabled={isReadOnly}
                    onChange={() =>
                      questionType === 'CHECKBOX' ? handleMultiSelect(option.id) : handleSingleSelect(option.id)
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-slate-700">{option.optionText}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <Textarea
            label="Your response"
            value={answer || ''}
            onChange={(event) => onAnswerChange(event.target.value)}
            disabled={isReadOnly}
            placeholder="Type your response here..."
            className="mt-3"
          />
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          {saved ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock3 className="h-4 w-4" />}
          {saved ? (lastSavedAt ? `Saved ${lastSavedAt}` : 'Saved') : 'Unsaved changes'}
        </div>
        <Button variant="outline" size="sm" onClick={onSave} loading={saving} disabled={isReadOnly || saving}>
          {saving ? 'Saving…' : 'Save Answer'}
        </Button>
      </div>
    </div>
  );
}
