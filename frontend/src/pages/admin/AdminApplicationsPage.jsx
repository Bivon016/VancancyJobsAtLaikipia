import { useEffect, useState } from 'react';
import { Select } from '../../components/ui/Input';
import PdfReportView from '../../components/pdf/PdfReportView';
import { applicationsApi, jobsApi } from '../../api';
import {
  formatDateTime,
  getApplicantName,
  STATUS_LABELS,
} from '../../utils/constants';

const COLUMNS = [
  { key: 'no', header: '#' },
  { key: 'name', header: 'Applicant Name' },
  { key: 'email', header: 'Email' },
  { key: 'nationalId', header: 'National ID' },
  { key: 'department', header: 'Department' },
  { key: 'position', header: 'Position' },
  { key: 'status', header: 'Status' },
  { key: 'date', header: 'Applied On' },
];

export default function AdminApplicationsPage() {
  const [vacancies, setVacancies] = useState([]);
  const [vacancyId, setVacancyId] = useState('');
  const [scope, setScope] = useState('vacancy');

  useEffect(() => {
    jobsApi.getAllOpen().then(({ data }) => {
      setVacancies(data);
      if (data.length) setVacancyId(String(data[0].id));
    }).catch(() => {});
  }, []);

  const selectedVacancy = vacancies.find((v) => v.id === Number(vacancyId));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-secondary">Applications Report</h1>
      <p className="mt-1 text-muted">View application lists as official PDF documents</p>

      <div className="mt-6 grid gap-4 rounded-lg border bg-white p-4 sm:grid-cols-2">
        <Select label="Report Scope" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="vacancy">By Vacancy</option>
          <option value="all">All Applications</option>
        </Select>
        {scope === 'vacancy' && (
          <Select label="Vacancy" value={vacancyId} onChange={(e) => setVacancyId(e.target.value)}>
            {vacancies.map((v) => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </Select>
        )}
      </div>

      <div className="mt-6">
        <PdfReportView
          key={`${scope}-${vacancyId}`}
          title={scope === 'all' ? 'All Job Applications' : `Applications — ${selectedVacancy?.title || 'Vacancy'}`}
          subtitle={
            scope === 'all'
              ? 'Laikipia County Public Service Board — Complete Application Register'
              : `${selectedVacancy?.department?.departmentName || ''} — Application Register`
          }
          columns={COLUMNS}
          filename={`applications_${scope === 'all' ? 'all' : vacancyId}.pdf`}
          fetchData={async () => {
            const { data } =
              scope === 'all'
                ? await applicationsApi.getAll()
                : await applicationsApi.getByVacancy(vacancyId);
            return data;
          }}
          buildRows={(apps) =>
            apps.map((app, i) => ({
              no: i + 1,
              name: getApplicantName(app),
              email: app.applicant?.user?.email || '—',
              nationalId: app.applicant?.nationalId || '—',
              department: app.vacancy?.department?.departmentName || '—',
              position: app.vacancy?.title || '—',
              status: STATUS_LABELS[app.applicationStatus] || app.applicationStatus,
              date: formatDateTime(app.applicationDate),
            }))
          }
        />
      </div>
    </div>
  );
}
