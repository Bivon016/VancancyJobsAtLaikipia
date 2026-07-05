import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import Input, { Textarea } from '../../../components/ui/Input';
import { questionSetService } from '../../../services/questionSetService';
import { formatDateTime } from '../../../utils/constants';

export default function QuestionSetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questionSet, setQuestionSet] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadQuestionSet = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await questionSetService.getById(id);
      setQuestionSet(data);
      setTitle(data.title || '');
      setDescription(data.description || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load the question set.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQuestionSet();
  }, [id]);

  const handleTogglePublish = async () => {
    if (!questionSet) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      const response = questionSet.published
        ? await questionSetService.unpublish(id)
        : await questionSetService.publish(id);
      setQuestionSet(response.data);
      setTitle(response.data.title || '');
      setDescription(response.data.description || '');
      setMessage(questionSet.published ? 'Question set unpublished.' : 'Question set published.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update publish status.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetails = async () => {
    try {
      setSaving(true);
      setError('');
      const { data } = await questionSetService.update(id, {
        title: title.trim(),
        description: description.trim(),
      });
      setQuestionSet(data);
      setMessage('Question set updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save question set details.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveQuestion = async (questionId) => {
    if (!window.confirm('Remove this question from the set?')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      await questionSetService.deleteQuestion(id, questionId);
      setMessage('Question removed from the set.');
      await loadQuestionSet();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove question.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="mx-auto max-w-6xl">
        <Card>
          <div className="p-6 text-sm text-slate-700">Unable to load this question set.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Card>
        <CardHeader
          title={questionSet.title || 'Question set'}
          subtitle={questionSet.description || 'Manage this question set and its questions.'}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/admin/online/question-sets')}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant={questionSet.published ? 'secondary' : 'primary'}
                loading={saving}
                onClick={handleTogglePublish}
              >
                {questionSet.published ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          }
        />
      </Card>

      {message && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="space-y-4 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Vacancy</p>
              <p className="mt-1 text-sm text-slate-700">{questionSet.vacancyTitle || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Status</p>
              <p className="mt-1 text-sm text-slate-700">{questionSet.published ? 'Published' : 'Draft'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Created by</p>
              <p className="mt-1 text-sm text-slate-700">{questionSet.createdByName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Created at</p>
              <p className="mt-1 text-sm text-slate-700">{questionSet.createdAt ? formatDateTime(questionSet.createdAt) : 'Unknown'}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Question count</p>
              <p className="mt-1 text-sm text-slate-700">{questionSet.items?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Set ID</p>
              <p className="mt-1 text-sm text-slate-700">{questionSet.id}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Input label="Set title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" loading={saving} onClick={handleSaveDetails} disabled={questionSet.published}>
              Save details
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        {questionSet.items?.length === 0 ? (
          <Card>
            <EmptyState
              title="No questions added"
              description="This set has no questions yet. Add questions from the question bank or use the manage page."
            />
          </Card>
        ) : (
          <div className="grid gap-4">
            {questionSet.items.map((item) => (
              <Card key={item.itemId} className="rounded-[24px] border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Question {item.orderIndex || item.itemId}</p>
                    <h3 className="mt-2 font-heading text-lg font-bold text-primary">{item.question?.questionText || 'Untitled question'}</h3>
                    <p className="mt-2 text-sm text-muted">{item.question?.questionType || 'Unknown type'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">Marks: {item.marks ?? 0}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">{item.required ? 'Required' : 'Optional'}</span>
                    {!questionSet.published && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveQuestion(item.question?.id)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
