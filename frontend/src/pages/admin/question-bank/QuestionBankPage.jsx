import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import Button from '../../../components/ui/Button';
import Input, { Select } from '../../../components/ui/Input';
import { questionBankService } from '../../../services/questionBankService';
import QuestionFormModal from './QuestionFormModal';

const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'];
const QUESTION_TYPES = ['LONG_ANSWER', 'SHORT_ANSWER', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'CHECKBOX', 'FILE_UPLOAD'];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await questionBankService.getAll();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesQuery = !query || q.questionText?.toLowerCase().includes(query.toLowerCase());
    const matchesDifficulty = !difficultyFilter || q.difficultyLevel === difficultyFilter;
    const matchesType = !typeFilter || q.questionType === typeFilter;
    return matchesQuery && matchesDifficulty && matchesType;
  });

  const openCreateModal = () => {
    setEditingQuestion(null);
    setModalOpen(true);
  };

  const openEditModal = (question) => {
    setEditingQuestion(question);
    setModalOpen(true);
  };

  const handleSaved = async () => {
    setModalOpen(false);
    setEditingQuestion(null);
    await load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await questionBankService.delete(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete question.');
    } finally {
      setDeletingId(null);
    }
  };

  const saveFn = editingQuestion
    ? (payload) => questionBankService.update(editingQuestion.id, payload)
    : (payload) => questionBankService.create(payload);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Card>
        <CardHeader
          title="Question Bank"
          subtitle="Manage interview questions"
          action={
            <Button variant="primary" onClick={openCreateModal}>
              Create question
            </Button>
          }
        />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Input placeholder="Search questions" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="">All difficulties</option>
            {DIFFICULTY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            {QUESTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="mt-6">
        {filteredQuestions.length === 0 ? (
          <Card>
            <EmptyState title="No questions" description="Create the first question to get started." />
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredQuestions.map((q) => (
              <Card key={q.id} className="rounded-[24px] border p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold text-primary">{q.questionText}</h3>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(q)}
                      className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      disabled={deletingId === q.id}
                      className="rounded-full p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">{q.questionType}</div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">{q.difficultyLevel}</div>
                  <div className="text-sm text-muted">Default marks: {q.defaultMarks}</div>
                </div>
                {q.options?.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-600">
                    {q.options.map((opt) => (
                      <li key={opt.id} className="flex items-center gap-2">
                        <span className={opt.correct ? 'font-semibold text-emerald-700' : ''}>
                          {opt.correct ? '✓' : '•'} {opt.optionText}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <QuestionFormModal
          question={editingQuestion}
          onClose={() => {
            setModalOpen(false);
            setEditingQuestion(null);
          }}
          onSaved={handleSaved}
          saveFn={saveFn}
        />
      )}
    </div>
  );
}
