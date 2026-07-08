import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock3, FileText, Send } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import InterviewHeader from '../../components/interviews/InterviewHeader';
import QuestionCard from '../../components/interviews/QuestionCard';
import ConfirmModal from '../../components/interviews/ConfirmModal';
import { answerService } from '../../services/answerService';
import { interviewService } from '../../services/interviewService';
import { formatDate, formatDateTime } from '../../utils/constants';

export default function InterviewPage() {
  const { token } = useParams();
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState({});
  const [savingMap, setSavingMap] = useState({});
  const [savedMap, setSavedMap] = useState({});
  const [lastSavedMap, setLastSavedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const timerRef = useRef(null);
  const [starting, setStarting] = useState(false);

  const loadInterview = async () => {
    try {
      setLoading(true);
      const { data } = await interviewService.getByToken(token);
      setInterview(data);
      const existing = await answerService.getMyAnswers(token);
      const answerMap = {};
      existing.data.forEach((item) => {
        answerMap[item.questionSetItemId] = item;
      });
      setAnswers(
        Object.fromEntries(
          (data.questions || []).map((question) => [
            String(question.questionSetItemId),
            answerMap[question.questionSetItemId]?.answerText || '',
          ]),
        ),
      );
      const savedState = {};
      const lastSavedState = {};
      existing.data.forEach((item) => {
        savedState[String(item.questionSetItemId)] = Boolean(item.answerText);
        lastSavedState[String(item.questionSetItemId)] = item.lastEditedAt;
      });
      setSavedMap(savedState);
      setLastSavedMap(lastSavedState);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load interview details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInterview();
  }, [token]);

  useEffect(() => {
    if (!token || !interview || interview.status !== 'IN_PROGRESS') {
  return;
}
    timerRef.current = window.setInterval(() => {
      const pendingEntries = Object.entries(answers).filter(([, value]) => Boolean(value));
      pendingEntries.forEach(([questionSetItemId, answerText]) => {
        const existingAnswer = savedMap[String(questionSetItemId)];
        if (existingAnswer || answerText.trim()) {
          void saveAnswer(questionSetItemId, answerText);
        }
      });
    }, 4000);

    return () => window.clearInterval(timerRef.current);
  }, [answers, interview, savedMap, token]);

  const saveAnswer = async (questionSetItemId, answerText) => {
    const key = String(questionSetItemId);
    if (savingMap[key]) return;
    setSavingMap((current) => ({ ...current, [key]: true }));
    try {
      await answerService.submitAnswer(token, { questionSetItemId, answerText });
      setSavedMap((current) => ({ ...current, [key]: true }));
      setLastSavedMap((current) => ({ ...current, [key]: new Date().toLocaleTimeString() }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save answer.');
    } finally {
      setSavingMap((current) => ({ ...current, [key]: false }));
    }
  };

  const handleSave = async (questionSetItemId) => {
    const answerText = answers[String(questionSetItemId)] || '';
    await saveAnswer(questionSetItemId, answerText);
  };
  const handleStart = async () => {
  try {
    setStarting(true);
    setError("");

    await interviewService.start(token);

    // Reload interview so status becomes IN_PROGRESS
    const { data } = await interviewService.getByToken(token);

    setInterview(data);
  } catch (err) {
    setError(
      err.response?.data?.message || "Unable to start interview."
    );
  } finally {
    setStarting(false);
  }
};

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await interviewService.submit(token);
      setSubmitMessage('Interview submitted successfully.');
      setInterview((current) => current ? { ...current, status: 'SUBMITTED' } : current);
      setConfirmOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit interview.');
    } finally {
      setSubmitting(false);
    }
  };
const isReadOnly = interview?.status !== 'IN_PROGRESS';

  const statusBadge = useMemo(() => {
    const styles = {
      OPEN: 'bg-amber-100 text-amber-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      SUBMITTED: 'bg-emerald-100 text-emerald-800',
      EVALUATED: 'bg-slate-100 text-slate-700',
      EXPIRED: 'bg-red-100 text-red-700',
    };
    return styles[interview?.status] || 'bg-slate-100 text-slate-700';
  }, [interview?.status]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!interview) {
    return <EmptyState title="Interview not found" description="The interview link may be invalid or expired." />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <InterviewHeader
        title="Interview Questions"
        subtitle={`Complete the questions below for ${interview.vacancyTitle || 'this vacancy'}.`}
        meta={[
          { label: 'Applicant', value: 'You', icon: 'user' },
          { label: 'Vacancy', value: interview.vacancyTitle || '—', icon: 'calendar' },
          { label: 'Status', value: interview.status || 'OPEN', icon: 'clock' },
        ]}
      />

      <Card className="mb-6 border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Interview information</p>
            <p className="mt-2 text-sm leading-6 text-muted">The interview window closes on {formatDateTime(interview.closesAt)}.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`rounded-full px-3 py-1 text-sm font-semibold ${statusBadge}`}>{interview.status}</div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
              <Clock3 className="h-4 w-4" />
              {interview.durationMinutes || 30} min
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {submitMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5" />
          <span>{submitMessage}</span>
        </div>
      )}

{interview.status === 'OPEN' && (
  <Card className="mb-6 border border-amber-200 bg-amber-50">
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-1 h-5 w-5 text-amber-600" />
      <div>
        <h3 className="font-semibold text-amber-900">
          Interview Ready
        </h3>
        <p className="mt-1 text-sm text-amber-800">
          Click <strong>Start Interview</strong> when you are ready.
          The interview timer will begin immediately and your answers will start
          being saved automatically.
        </p>
      </div>
    </div>
  </Card>
)}
      <div className="space-y-4">
        {(interview.questions || []).map((question, index) => (
          <QuestionCard
            key={question.questionSetItemId}
            question={question}
            answer={answers[String(question.questionSetItemId)] || ''}
            onAnswerChange={(value) => setAnswers((current) => ({ ...current, [String(question.questionSetItemId)]: value }))}
            onSave={() => handleSave(question.questionSetItemId)}
            saving={savingMap[String(question.questionSetItemId)]}
            saved={savedMap[String(question.questionSetItemId)]}
            lastSavedAt={lastSavedMap[String(question.questionSetItemId)]}
            isReadOnly={isReadOnly}
            maxMarks={question.marks}
            index={index + 1}
          />
        ))}
      </div>

      <Card className="mt-6 border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <FileText className="h-4 w-4" />
            Your responses will be auto-saved every few seconds.
          </div>
  {interview.status === 'OPEN' ? (
  <Button
    variant="primary"
    onClick={handleStart}
    disabled={starting}
  >
    Start Interview
  </Button>
) : (
  <Button
    variant="primary"
    onClick={() => setConfirmOpen(true)}
    disabled={isReadOnly || submitting}
  >
    <Send className="h-4 w-4" />
    Submit Interview
  </Button>
)}
        </div>
      </Card>

      {confirmOpen && (
        <ConfirmModal
          title="Submit interview"
          description="Once submitted, your responses will be locked and no further edits will be allowed."
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleSubmit}
          confirmLabel="Submit"
          loading={submitting}
        />
      )}
    </div>
  );
}
