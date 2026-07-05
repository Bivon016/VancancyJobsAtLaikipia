import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import QuestionEditorCard, { validateQuestion } from '../../../components/interviews/QuestionEditorCard';

export default function QuestionFormModal({ question, onClose, onSaved, saveFn }) {
  const isEditing = Boolean(question);

  const [draft, setDraft] = useState(() => ({
    questionText: question?.questionText || '',
    questionType: question?.questionType || 'SHORT_ANSWER',
    defaultMarks: question?.defaultMarks || 5,
    difficultyLevel: question?.difficultyLevel || 'EASY',
    required: question?.required ?? true,
    expectedAnswer: question?.expectedAnswer || '',
    markingGuide: question?.markingGuide || '',
    options: question?.options?.length
      ? question.options.map((o) => ({ optionText: o.optionText, correct: Boolean(o.correct) }))
      : [],
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateQuestion(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    const isOptionBased = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CHECKBOX'].includes(draft.questionType);
    const payload = {
      questionText: draft.questionText.trim(),
      questionType: draft.questionType,
      defaultMarks: Number(draft.defaultMarks),
      difficultyLevel: draft.difficultyLevel,
      required: draft.required,
      expectedAnswer: draft.expectedAnswer.trim() || null,
      markingGuide: draft.markingGuide.trim() || null,
      options: isOptionBased ? draft.options.map((o) => ({ optionText: o.optionText.trim(), correct: o.correct })) : null,
    };

    try {
      setSaving(true);
      setError('');
      await saveFn(payload);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-slate-50 p-6 pl-8 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-primary">
            {isEditing ? 'Edit question' : 'New question'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-muted hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <QuestionEditorCard question={draft} onChange={setDraft} index={1} autoFocus={!isEditing} />

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving} disabled={saving}>
              {isEditing ? 'Save changes' : 'Create question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
