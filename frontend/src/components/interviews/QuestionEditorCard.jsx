import { useRef, useState } from 'react';
import {
  AlignLeft,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Copy,
  FileUp,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

export const QUESTION_TYPES = [
  { value: 'SHORT_ANSWER', label: 'Short answer', icon: AlignLeft },
  { value: 'LONG_ANSWER', label: 'Paragraph', icon: AlignLeft },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple choice', icon: CircleDot },
  { value: 'TRUE_FALSE', label: 'True / False', icon: CircleDot },
  { value: 'CHECKBOX', label: 'Checkboxes', icon: CheckSquare },
  { value: 'FILE_UPLOAD', label: 'File upload', icon: FileUp },
];

const OPTION_BASED_TYPES = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CHECKBOX'];
const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'];

export function emptyQuestion() {
  return {
    questionText: '',
    questionType: 'SHORT_ANSWER',
    defaultMarks: 5,
    difficultyLevel: 'EASY',
    required: true,
    expectedAnswer: '',
    markingGuide: '',
    options: [],
  };
}

export function duplicateQuestion(question) {
  return {
    ...question,
    options: question.options.map((o) => ({ ...o })),
  };
}

// Shared validation so every place that creates questions enforces the same
// rules as the backend - divergent copies of this logic is what caused the
// silent "options never sent" bug last time.
export function validateQuestion(question) {
  if (!question.questionText.trim()) return 'Question text is required.';
  if (!question.defaultMarks || Number(question.defaultMarks) <= 0) return 'Marks must be greater than 0.';

  if (OPTION_BASED_TYPES.includes(question.questionType)) {
    const opts = question.options || [];
    if (opts.length < 2) return `${labelFor(question.questionType)} questions need at least 2 options.`;
    if (opts.some((o) => !o.optionText.trim())) return 'Every option needs text.';
    const correctCount = opts.filter((o) => o.correct).length;
    if (correctCount === 0) return 'Mark at least one option as correct.';
    if ((question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') && correctCount !== 1) {
      return `${labelFor(question.questionType)} questions need exactly one correct option.`;
    }
  }
  return '';
}

function labelFor(type) {
  return QUESTION_TYPES.find((t) => t.value === type)?.label || type;
}

function optionsForTypeChange(previousOptions, newType) {
  if (newType === 'TRUE_FALSE') {
    return [
      { optionText: 'True', correct: true },
      { optionText: 'False', correct: false },
    ];
  }
  if (newType === 'MULTIPLE_CHOICE' || newType === 'CHECKBOX') {
    return previousOptions && previousOptions.length >= 2
      ? previousOptions
      : [{ optionText: '', correct: false }, { optionText: '', correct: false }];
  }
  return [];
}

export default function QuestionEditorCard({
  question,
  onChange,
  index,
  onDuplicate,
  onDelete,
  autoFocus,
}) {
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(question.expectedAnswer || question.markingGuide));
  const optionRefs = useRef([]);
  const isOptionBased = OPTION_BASED_TYPES.includes(question.questionType);
  const isTrueFalse = question.questionType === 'TRUE_FALSE';
  const ActiveIcon = QUESTION_TYPES.find((t) => t.value === question.questionType)?.icon || AlignLeft;

  const update = (patch) => onChange({ ...question, ...patch });

  const handleTypeChange = (newType) => {
    update({ questionType: newType, options: optionsForTypeChange(question.options, newType) });
  };

  const updateOption = (i, patch) => {
    const next = question.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o));
    update({ options: next });
  };

  const toggleCorrect = (i) => {
    if (question.questionType === 'CHECKBOX') {
      updateOption(i, { correct: !question.options[i].correct });
    } else {
      update({ options: question.options.map((o, idx) => ({ ...o, correct: idx === i })) });
    }
  };

  const addOption = (focusAfter = true) => {
    const next = [...question.options, { optionText: '', correct: false }];
    update({ options: next });
    if (focusAfter) {
      requestAnimationFrame(() => optionRefs.current[next.length - 1]?.focus());
    }
  };

  const removeOption = (i) => {
    update({ options: question.options.filter((_, idx) => idx !== i) });
  };

  const handleOptionKeyDown = (event, i) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (i === question.options.length - 1) {
        addOption();
      } else {
        optionRefs.current[i + 1]?.focus();
      }
    } else if (event.key === 'Backspace' && question.options[i].optionText === '' && question.options.length > 2) {
      event.preventDefault();
      removeOption(i);
      requestAnimationFrame(() => optionRefs.current[Math.max(0, i - 1)]?.focus());
    }
  };

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute -left-3 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        {index}
      </div>

      <textarea
        autoFocus={autoFocus}
        value={question.questionText}
        onChange={(e) => update({ questionText: e.target.value })}
        placeholder="Type your question here..."
        rows={1}
        className="w-full resize-none border-0 border-b-2 border-transparent bg-transparent pb-2 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none"
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="relative">
          <ActiveIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={question.questionType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="rounded-md border border-gray-300 py-2 pl-8 pr-8 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={question.difficultyLevel}
          onChange={(e) => update({ difficultyLevel: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {DIFFICULTY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="1"
            value={question.defaultMarks}
            onChange={(e) => update({ defaultMarks: e.target.value })}
            className="w-16 rounded-md border border-gray-300 px-2 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-sm text-slate-500">marks</span>
        </div>
      </div>

      {question.questionType === 'FILE_UPLOAD' && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          File upload isn't supported on the applicant interview page yet — avoid using this type for now.
        </div>
      )}

      {isOptionBased && (
        <div className="mt-4 space-y-2">
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type={question.questionType === 'CHECKBOX' ? 'checkbox' : 'radio'}
                name={`correct-${index}`}
                checked={opt.correct}
                onChange={() => toggleCorrect(i)}
                className="h-4 w-4 shrink-0 accent-primary"
              />
              <input
                ref={(el) => (optionRefs.current[i] = el)}
                type="text"
                value={opt.optionText}
                disabled={isTrueFalse}
                onChange={(e) => updateOption(i, { optionText: e.target.value })}
                onKeyDown={(e) => handleOptionKeyDown(e, i)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 border-0 border-b border-slate-200 bg-transparent px-1 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none disabled:text-slate-500"
              />
              {!isTrueFalse && question.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {!isTrueFalse && (
            <button
              type="button"
              onClick={() => addOption()}
              className="flex items-center gap-1.5 pl-6 text-sm text-slate-500 hover:text-primary"
            >
              <Plus className="h-4 w-4" /> Add option
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setAdvancedOpen((open) => !open)}
        className="mt-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
      >
        {advancedOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        Panel-only guidance (optional)
      </button>

      {advancedOpen && (
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <textarea
            value={question.expectedAnswer}
            onChange={(e) => update({ expectedAnswer: e.target.value })}
            placeholder="Expected answer — visible to panel members only"
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            value={question.markingGuide}
            onChange={(e) => update({ markingGuide: e.target.value })}
            placeholder="Marking guide — visible to panel members only"
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="relative inline-flex h-5 w-9 items-center">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => update({ required: e.target.checked })}
              className="peer sr-only"
            />
            <span className="absolute inset-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-primary" />
            <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
          Required
        </label>

        <div className="flex items-center gap-1">
          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              title="Duplicate question"
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete question"
              className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
