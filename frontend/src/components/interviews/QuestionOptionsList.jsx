import { Check, X } from 'lucide-react';

/**
 * Renders the option list (MULTIPLE_CHOICE / TRUE_FALSE / CHECKBOX) for a
 * question. This is the single shared rendering used everywhere an option
 * list needs to appear, so the applicant answering an interview, the panel
 * reviewing a submitted answer, and the panel previewing a question set all
 * see the exact same layout for the same question.
 *
 * Modes (controlled by props, not separate components):
 *  - interactive: applicant can pick an option (radio/checkbox), onSelect fires
 *  - read-only + selectedIds: panel review — shows what the applicant picked
 *  - read-only + no selectedIds: question-bank preview — just lists options
 *
 * If `showCorrectness` is true and an option's `correct` flag is present,
 * a check/cross badge is shown next to the option (panel-only views).
 */
export default function QuestionOptionsList({
  options = [],
  questionType,
  selectedIds = [],
  onSelect,
  isReadOnly = false,
  showCorrectness = false,
}) {
  const isCheckbox = questionType === 'CHECKBOX';
  const isReadOnlyEffective = isReadOnly || !onSelect;

  if (options.length === 0) {
    return (
      <p className="text-sm text-amber-700">
        This question has no options configured. Contact HR — it may need to be fixed in the question bank.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const id = String(option.id);
        const checked = isCheckbox ? selectedIds.includes(id) : selectedIds[0] === id;
        const isCorrect = option.correct === true;
        const isIncorrectPick = showCorrectness && checked && option.correct === false;

        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
              checked ? 'border-primary bg-primary/5' : 'border-slate-200'
            } ${isReadOnlyEffective ? 'cursor-not-allowed opacity-90' : 'hover:border-primary/50'}`}
          >
            <input
              type={isCheckbox ? 'checkbox' : 'radio'}
              name={`question-options-${questionType}`}
              checked={checked}
              disabled={isReadOnlyEffective}
              onChange={() => onSelect && onSelect(option.id)}
              className="h-4 w-4"
            />
            <span className="flex-1 text-slate-700">{option.optionText}</span>
            {showCorrectness && isCorrect && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Correct
              </span>
            )}
            {isIncorrectPick && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                <X className="h-3.5 w-3.5" /> Applicant's pick
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
