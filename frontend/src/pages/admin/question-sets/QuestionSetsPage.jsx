import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader } from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';
import Button from '../../../components/ui/Button';
import { questionSetService } from '../../../services/questionSetService';
import { formatDateTime } from '../../../utils/constants';

export default function QuestionSetsPage() {
  const navigate = useNavigate();
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await questionSetService.getAll();
        setSets(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load question sets.');
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
        <CardHeader title="Question Sets" subtitle="Manage question sets (papers)" action={<Button variant="primary">Create set</Button>} />
      </Card>

      <div className="mt-6">
        {sets.length === 0 ? (
          <Card>
            <EmptyState title="No question sets" description="Create a question set to start building interview papers." />
          </Card>
        ) : (
          <div className="grid gap-4">
            {sets.map((s) => (
              <Card key={s.id} className="rounded-[24px] border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-primary">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted">{s.vacancyTitle || 'Vacancy not set'}</p>
                    <p className="mt-2 text-xs text-muted">{s.items?.length || 0} questions • Created {formatDateTime(s.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/online/question-sets/${s.id}`)}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/online/question-sets/${s.id}`)}>
                      Edit
                    </Button>
                  </div>
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
