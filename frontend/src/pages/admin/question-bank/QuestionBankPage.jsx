import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { questionBankService } from '../../../services/questionBankService';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await questionBankService.getAll({ q: query });
        setQuestions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load questions.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [query]);

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
        <CardHeader title="Question Bank" subtitle="Manage interview questions" action={<Button variant="primary">Create question</Button>} />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Input placeholder="Search questions" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </Card>

      <div className="mt-6">
        {questions.length === 0 ? (
          <Card>
            <EmptyState title="No questions" description="Create the first question to get started." />
          </Card>
        ) : (
          <div className="grid gap-4">
            {questions.map((q) => (
              <Card key={q.id} className="rounded-[24px] border p-4">
                <h3 className="font-heading text-lg font-bold text-primary">{q.title}</h3>
                <p className="mt-2 text-sm text-muted">{q.questionText}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">{q.questionType}</div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">{q.difficultyLevel}</div>
                  <div className="text-sm text-muted">Default marks: {q.defaultMarks}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
    </div>
  );
}
