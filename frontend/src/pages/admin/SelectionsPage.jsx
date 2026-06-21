import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input, { Select } from '../../components/ui/Input';
import PdfReportView from '../../components/pdf/PdfReportView';
import { jobsApi, selectionsApi } from '../../api';
import {
  formatDateTime,
  getApplicantName,
} from '../../utils/constants';

const COLUMNS = [
  { key: 'no', header: '#' },
  { key: 'name', header: 'Selected Candidate' },
  { key: 'email', header: 'Email' },
  { key: 'nationalId', header: 'National ID' },
  { key: 'position', header: 'Position' },
  { key: 'department', header: 'Department' },
  { key: 'approvalDate', header: 'Selection Date' },
  { key: 'appointment', header: 'Appointment Status' },
  { key: 'remarks', header: 'Remarks' },
];

export default function SelectionsPage() {
  const [vacancies, setVacancies] = useState([]);
  const [vacancyId, setVacancyId] = useState('');
  const [form, setForm] = useState({ applicationId: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    jobsApi.getAllOpen().then(({ data }) => {
      setVacancies(data);
      if (data.length) setVacancyId(String(data[0].id));
    }).catch(() => {});
  }, []);

  const selectedVacancy = vacancies.find((v) => v.id === Number(vacancyId));

  const handleSelect = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await selectionsApi.create({
        applicationId: Number(form.applicationId),
        remarks: form.remarks,
      });
      setMessage('Candidate selected.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-secondary">Final Selection</h1>
      <p className="mt-1 text-muted">Record final selections and view official PDF selection reports</p>

      <Card className="mt-6">
        <CardHeader title="Select Candidate" />
        <form onSubmit={handleSelect} className="grid gap-4 sm:grid-cols-2">
          <Input label="Application ID" type="number" required value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: e.target.value })} />
          <Input label="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          {message && <p className="text-sm text-muted sm:col-span-2">{message}</p>}
          <Button type="submit" loading={loading}>Record Selection</Button>
        </form>
      </Card>

      <div className="mt-6">
        <Select label="View Selection PDF for" value={vacancyId} onChange={(e) => setVacancyId(e.target.value)} className="mb-4 max-w-md">
          {vacancies.map((v) => (
            <option key={v.id} value={v.id}>{v.title}</option>
          ))}
        </Select>

        <PdfReportView
          key={vacancyId}
          title={`Final Selection — ${selectedVacancy?.title || ''}`}
          subtitle="Laikipia County Public Service Board — Selection & Appointment Register"
          columns={COLUMNS}
          filename={`selections_vacancy_${vacancyId}.pdf`}
          fetchData={async () => {
            const { data } = await selectionsApi.getByVacancy(vacancyId);
            return data;
          }}
          buildRows={(items) =>
            items.map((s, i) => ({
              no: i + 1,
              name: getApplicantName(s.application),
              email: s.application?.applicant?.user?.email || '—',
              nationalId: s.application?.applicant?.nationalId || '—',
              position: s.application?.vacancy?.title || '—',
              department: s.application?.vacancy?.department?.departmentName || '—',
              approvalDate: formatDateTime(s.approvalDate),
              appointment: s.appointmentStatus || '—',
              remarks: s.remarks || '—',
            }))
          }
        />
      </div>
    </div>
  );
}
