import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input, { Select } from '../../components/ui/Input';
import PdfReportView from '../../components/pdf/PdfReportView';
import { interviewsApi, scoresApi } from '../../api';
import { formatDate, getApplicantName } from '../../utils/constants';
import { useAuth } from '../../auth/AuthContext';
import { normalizeRole, ROLES } from '../../utils/roles';

const COLUMNS = [
  { key: 'no', header: '#' },
  { key: 'candidate', header: 'Candidate' },
  { key: 'position', header: 'Position' },
  { key: 'date', header: 'Interview Date' },
  { key: 'time', header: 'Time' },
  { key: 'venue', header: 'Venue' },
  { key: 'status', header: 'Status' },
];

export default function InterviewsPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isPanel = role === ROLES.PANEL_MEMBER;

  const [interviews, setInterviews] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: '',
    interviewDate: '',
    interviewTime: '',
    venue: '',
  });
  const [scoreForm, setScoreForm] = useState({
    interviewId: '',
    technicalScore: '',
    communicationScore: '',
    experienceScore: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    const fetcher = isPanel
      ? interviewsApi.getMy()
      : interviewsApi.getByStatus('SCHEDULED');
    fetcher.then(({ data }) => setInterviews(data)).catch(() => setInterviews([]));
  };

  useEffect(() => { load(); }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await interviewsApi.schedule({
        ...scheduleForm,
        applicationId: Number(scheduleForm.applicationId),
      });
      setMessage('Interview scheduled.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await scoresApi.submit({
        interviewId: Number(scoreForm.interviewId),
        technicalScore: Number(scoreForm.technicalScore),
        communicationScore: Number(scoreForm.communicationScore),
        experienceScore: Number(scoreForm.experienceScore),
        remarks: scoreForm.remarks,
      });
      setMessage('Score submitted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-secondary">Interviews</h1>
      <p className="mt-1 text-muted">
        {isPanel ? 'View assigned interviews and submit scores' : 'Schedule interviews and view PDF schedules'}
      </p>

      {!isPanel && (
        <Card className="mt-6">
          <CardHeader title="Schedule Interview" />
          <form onSubmit={handleSchedule} className="grid gap-4 sm:grid-cols-2">
            <Input label="Application ID" type="number" required value={scheduleForm.applicationId} onChange={(e) => setScheduleForm({ ...scheduleForm, applicationId: e.target.value })} />
            <Input label="Date" type="date" required value={scheduleForm.interviewDate} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewDate: e.target.value })} />
            <Input label="Time" type="time" required value={scheduleForm.interviewTime} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewTime: e.target.value })} />
            <Input label="Venue" required value={scheduleForm.venue} onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })} />
            <Button type="submit" loading={loading}>Schedule</Button>
          </form>
        </Card>
      )}

      {isPanel && (
        <Card className="mt-6">
          <CardHeader title="Submit Interview Score" />
          <form onSubmit={handleScore} className="grid gap-4 sm:grid-cols-2">
            <Input label="Interview ID" type="number" required value={scoreForm.interviewId} onChange={(e) => setScoreForm({ ...scoreForm, interviewId: e.target.value })} />
            <Input label="Technical Score" type="number" step="0.1" required value={scoreForm.technicalScore} onChange={(e) => setScoreForm({ ...scoreForm, technicalScore: e.target.value })} />
            <Input label="Communication Score" type="number" step="0.1" required value={scoreForm.communicationScore} onChange={(e) => setScoreForm({ ...scoreForm, communicationScore: e.target.value })} />
            <Input label="Experience Score" type="number" step="0.1" required value={scoreForm.experienceScore} onChange={(e) => setScoreForm({ ...scoreForm, experienceScore: e.target.value })} />
            <Input label="Remarks" className="sm:col-span-2" value={scoreForm.remarks} onChange={(e) => setScoreForm({ ...scoreForm, remarks: e.target.value })} />
            <Button type="submit" loading={loading}>Submit Score</Button>
          </form>
        </Card>
      )}

      {message && <p className="mt-4 text-sm text-muted">{message}</p>}

      <div className="mt-6">
        <PdfReportView
          title={isPanel ? 'My Assigned Interviews' : 'Scheduled Interviews'}
          subtitle="Laikipia County Public Service Board — Interview Schedule"
          columns={COLUMNS}
          filename="interview_schedule.pdf"
          fetchData={async () => interviews}
          buildRows={(items) =>
            items.map((iv, i) => ({
              no: i + 1,
              candidate: getApplicantName(iv.application),
              position: iv.application?.vacancy?.title || '—',
              date: formatDate(iv.interviewDate),
              time: iv.interviewTime || '—',
              venue: iv.venue || '—',
              status: iv.status || '—',
            }))
          }
        />
      </div>
    </div>
  );
}
