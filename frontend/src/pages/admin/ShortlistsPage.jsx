import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input, { Select } from '../../components/ui/Input';
import PdfReportView from '../../components/pdf/PdfReportView';
import { applicationsApi, jobsApi, shortlistApi } from '../../api';
import {
  formatDateTime,
  getApplicantName,
} from '../../utils/constants';

const COLUMNS = [
  { key: 'no', header: '#' },
  { key: 'name', header: 'Applicant Name' },
  { key: 'email', header: 'Email' },
  { key: 'nationalId', header: 'National ID' },
  { key: 'education', header: 'Education' },
  { key: 'experience', header: 'Experience (Yrs)' },
  { key: 'shortlistedDate', header: 'Shortlisted On' },
  { key: 'remarks', header: 'Remarks' },
];

export default function ShortlistsPage() {
  const [vacancies, setVacancies] = useState([]);
  const [vacancyId, setVacancyId] = useState('');
  const [applications, setApplications] = useState([]);
  const [shortlistAppId, setShortlistAppId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    jobsApi.getAllOpen().then(({ data }) => {
      setVacancies(data);
      if (data.length) setVacancyId(String(data[0].id));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!vacancyId) return;
    applicationsApi.getByVacancy(vacancyId).then(({ data }) => setApplications(data));
  }, [vacancyId]);

  const selectedVacancy = vacancies.find((v) => v.id === Number(vacancyId));

  const handleShortlist = async (e) => {
    e.preventDefault();
    if (!shortlistAppId) return;
    setLoading(true);
    try {
      await shortlistApi.create({ applicationId: Number(shortlistAppId), remarks });
      setMessage('Applicant shortlisted.');
      setRemarks('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to shortlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-secondary">Shortlist Management</h1>
      <p className="mt-1 text-muted">Shortlist candidates and generate official PDF shortlist reports</p>

      <Card className="mt-6">
        <CardHeader title="Shortlist Applicant" />
        <form onSubmit={handleShortlist} className="grid gap-4 sm:grid-cols-2">
          <Select label="Vacancy" value={vacancyId} onChange={(e) => setVacancyId(e.target.value)}>
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </Select>
          <Select label="Application" value={shortlistAppId} onChange={(e) => setShortlistAppId(e.target.value)}>
            <option value="">Select applicant</option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>{getApplicantName(a)} — {a.applicationStatus}</option>
            ))}
          </Select>
          <Input label="Remarks" className="sm:col-span-2" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          {message && <p className="text-sm text-muted sm:col-span-2">{message}</p>}
          <Button type="submit" loading={loading}>Add to Shortlist</Button>
        </form>
      </Card>

      <div className="mt-6">
        <Select label="View Shortlist PDF for" value={vacancyId} onChange={(e) => setVacancyId(e.target.value)} className="mb-4 max-w-md">
          {vacancies.map((v) => (
            <option key={v.id} value={v.id}>{v.title}</option>
          ))}
        </Select>

        <PdfReportView
          key={vacancyId}
          title={`Shortlisted Candidates — ${selectedVacancy?.title || ''}`}
          subtitle={`${selectedVacancy?.department?.departmentName || ''} — Official Shortlist Register`}
          columns={COLUMNS}
          filename={`shortlist_vacancy_${vacancyId}.pdf`}
          fetchData={async () => {
            const { data } = await shortlistApi.getByVacancy(vacancyId);
            return data;
          }}
          buildRows={(items) =>
            items.map((s, i) => ({
              no: i + 1,
              name: getApplicantName(s.application),
              email: s.application?.applicant?.user?.email || '—',
              nationalId: s.application?.applicant?.nationalId || '—',
              education: s.application?.applicant?.educationalLevel || '—',
              experience: s.application?.applicant?.yearsOfExperience ?? '—',
              shortlistedDate: formatDateTime(s.shortlistedDate),
              remarks: s.remarks || '—',
            }))
          }
        />
      </div>
    </div>
  );
}
