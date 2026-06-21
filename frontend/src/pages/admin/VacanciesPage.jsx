import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input, { Select, Textarea } from '../../components/ui/Input';
import { jobsApi, recruitmentApi } from '../../api';
import { formatDate } from '../../utils/constants';

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [form, setForm] = useState({
    recruitmentRequestId: '',
    title: '',
    jobDescription: '',
    requirements: '',
    salaryScale: '',
    positionsAvailable: 1,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => jobsApi.getAllOpen().then(({ data }) => setVacancies(data));

  useEffect(() => {
    load();
    recruitmentApi.getAll().then(({ data }) =>
      setApprovedRequests(data.filter((r) => r.status === 'APPROVED'))
    ).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobsApi.create({
        ...form,
        recruitmentRequestId: Number(form.recruitmentRequestId),
        positionsAvailable: Number(form.positionsAvailable),
      });
      setMessage('Vacancy created.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create vacancy');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (id) => {
    await jobsApi.close(id);
    load();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-bold text-secondary">Vacancy Management</h1>

      <Card className="mt-6">
        <CardHeader title="Create Vacancy from Approved Request" />
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Approved Recruitment Request" required value={form.recruitmentRequestId} onChange={(e) => {
            const req = approvedRequests.find((r) => r.id === Number(e.target.value));
            setForm({
              ...form,
              recruitmentRequestId: e.target.value,
              title: req?.jobTitle || form.title,
              jobDescription: req?.jobDescription || form.jobDescription,
              requirements: req?.requirements || form.requirements,
              positionsAvailable: req?.numberOfPositions || 1,
            });
          }}>
            <option value="">Select request</option>
            {approvedRequests.map((r) => (
              <option key={r.id} value={r.id}>{r.jobTitle} — {r.department?.departmentName}</option>
            ))}
          </Select>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" required value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })} />
          <Textarea label="Requirements" required value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          <Input label="Salary Scale" required value={form.salaryScale} onChange={(e) => setForm({ ...form, salaryScale: e.target.value })} />
          <Input label="Positions" type="number" min="1" required value={form.positionsAvailable} onChange={(e) => setForm({ ...form, positionsAvailable: e.target.value })} />
          {message && <div className="rounded-md bg-blue-50 p-3 text-sm">{message}</div>}
          <Button type="submit" loading={loading}>Publish Vacancy</Button>
        </form>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Open Vacancies" />
        <ul className="divide-y text-sm">
          {vacancies.map((v) => (
            <li key={v.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{v.title}</p>
                <p className="text-muted">{v.department?.departmentName} — Posted {formatDate(v.createdAt)}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleClose(v.id)}>Close</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
