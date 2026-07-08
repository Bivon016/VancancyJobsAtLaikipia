import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, FileText, ListChecks } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import InterviewHeader from '../../components/interviews/InterviewHeader';
import ProgressCard from '../../components/interviews/ProgressCard';
import ScoreCard from '../../components/interviews/ScoreCard';
import { answerService } from '../../services/answerService';
import { interviewService } from '../../services/interviewService';
import { scoreService } from '../../services/scoreService';
import { resultService } from '../../services/resultService';
import { formatDateTime } from '../../utils/constants';

export default function OnlineInterviewPanelPage() {
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingMap, setSavingMap] = useState({});
  const [savedMap, setSavedMap] = useState({});
  const [savingAll, setSavingAll] = useState(false);
  const [result, setResult] = useState(null);
  const [interviewId, setInterviewId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialId = params.get('interviewId');
    if (!initialId) {
      setError('No interview selected.');
      setLoading(false);
      return;
    }
    setInterviewId(initialId);
    const load = async () => {
      try {
        setLoading(true);
        const [interviewResult, answersResult, scoresResult, resultResult] = await Promise.all([
          interviewService.getById(initialId),
          answerService.getAnswersForPanel(initialId),
          scoreService.getScoresForInterview(initialId),
          resultService.getResult(initialId).catch(() => null),
        ]);
        setInterview(interviewResult.data);
        setAnswers(answersResult.data || []);
        const scoreMap = {};
        (scoresResult.data || []).forEach((score) => {
          scoreMap[String(score.applicantAnswerId)] = score;
        });
        setScores(scoreMap);
        setResult(resultResult?.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load interview evaluation.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSaveScore = async (answerId, questionSetItemId, maxMarks, value, comment, recommended) => {
    const key = String(answerId);
    setSavingMap((current) => ({ ...current, [key]: true }));
    try {
      const payload = { applicantAnswerId: answerId, marksAwarded: value === '' ? null : Number(value), comment, recommended };
      const { data } = await scoreService.submitScore(payload);
      setScores((current) => ({ ...current, [key]: data }));
      setSavedMap((current) => ({ ...current, [key]: true }));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save score.');
    } finally {
      setSavingMap((current) => ({ ...current, [key]: false }));
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    setError('');
    // Only send answers that actually have something entered, so a
    // half-reviewed interview doesn't get zero-marked answers submitted.
    const toSave = answers.filter((answer) => {
      const score = scores[String(answer.id)] || {};
      return score.marksAwarded !== '' && score.marksAwarded != null || score.comment || score.recommended;
    });

    if (toSave.length === 0) {
      setError('Enter at least one mark or comment before saving.');
      setSavingAll(false);
      return;
    }

    setSavingMap((current) => {
      const next = { ...current };
      toSave.forEach((answer) => { next[String(answer.id)] = true; });
      return next;
    });

    const results = await Promise.allSettled(
      toSave.map((answer) => {
        const score = scores[String(answer.id)] || {};
        const payload = {
          applicantAnswerId: answer.id,
          marksAwarded: score.marksAwarded === '' || score.marksAwarded == null ? null : Number(score.marksAwarded),
          comment: score.comment || '',
          recommended: Boolean(score.recommended),
        };
        return scoreService.submitScore(payload).then((res) => ({ answerId: answer.id, data: res.data }));
      })
    );

    const nextScores = {};
    const nextSaved = {};
    const nextSaving = {};
    let failureCount = 0;

    results.forEach((outcome, index) => {
      const answerId = toSave[index].id;
      const key = String(answerId);
      nextSaving[key] = false;
      if (outcome.status === 'fulfilled') {
        nextScores[key] = outcome.value.data;
        nextSaved[key] = true;
      } else {
        failureCount += 1;
      }
    });

    setScores((current) => ({ ...current, ...nextScores }));
    setSavedMap((current) => ({ ...current, ...nextSaved }));
    setSavingMap((current) => ({ ...current, ...nextSaving }));

    if (failureCount > 0) {
      setError(`${failureCount} of ${toSave.length} score(s) could not be saved. Please retry those.`);
    }

    setSavingAll(false);
  };

  const progress = useMemo(() => {
    const total = answers.length;
    const scored = Object.values(scores).filter((value) => value?.marksAwarded != null || value?.comment || value?.recommended != null).length;
    const percent = total ? Math.round((scored / total) * 100) : 0;
    return { total, scored, percent };
  }, [answers, scores]);

  if (loading) {
    return (<div className="mx-auto flex max-w-6xl justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>);
  }

  if (!interview) {
    return <EmptyState title="Interview unavailable" description="The selected interview could not be loaded." />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <InterviewHeader
        title="Panel evaluation"
        subtitle="Review each candidate answer and record your score for the interview."
        meta={[
          { label: 'Applicant', value: interview.applicantName || '—', icon: 'user' },
          { label: 'Vacancy', value: interview.vacancyTitle || '—', icon: 'calendar' },
          { label: 'Status', value: interview.status || 'SCHEDULED', icon: 'clock' },
        ]}
      />

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <ProgressCard scored={progress.scored} total={progress.total} percent={progress.percent} />

      <div className="mb-6 flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => navigate('/admin/interviews')}>
          <Eye className="h-4 w-4" />
          Back to interviews
        </Button>
        <Button variant="primary" onClick={handleSaveAll} loading={savingAll} disabled={savingAll}>
          <CheckCircle2 className="h-4 w-4" />
          {savingAll ? 'Saving all…' : 'Save all scores'}
        </Button>
        {result ? (
          <Link to={`/admin/interviews/result?interviewId=${interviewId}`}>
            <Button variant="secondary">
              <ListChecks className="h-4 w-4" />
              View result
            </Button>
          </Link>
        ) : (
          <Button variant="secondary" onClick={() => navigate(`/admin/interviews/result?interviewId=${interviewId}`)}>
            <FileText className="h-4 w-4" />
            Open result page
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {answers.map((answer, index) => {
          const score = scores[String(answer.id)] || {};
          return (
            <ScoreCard
              key={answer.id}
              question={{ questionText: answer.questionText }}
              answer={answer.answerText}
              questionType={answer.questionType}
              options={answer.options}
              selectedOptionIds={answer.selectedOptionIds}
              answeredCorrectly={answer.answeredCorrectly}
              score={score}
              maxMarks={answer.maxMarks}
              index={index + 1}
              isReadOnly={false}
              onScoreChange={(value) => {
                const next = { ...score, marksAwarded: value };
                setScores((current) => ({ ...current, [String(answer.id)]: next }));
              }}
              onCommentChange={(value) => {
                const next = { ...score, comment: value };
                setScores((current) => ({ ...current, [String(answer.id)]: next }));
              }}
              onRecommendationChange={(value) => {
                const next = { ...score, recommended: value };
                setScores((current) => ({ ...current, [String(answer.id)]: next }));
              }}
              saving={savingMap[String(answer.id)]}
              saved={savedMap[String(answer.id)]}
              onSave={() => handleSaveScore(answer.id, answer.questionSetItemId, answer.maxMarks, scores[String(answer.id)]?.marksAwarded || '', scores[String(answer.id)]?.comment || '', Boolean(scores[String(answer.id)]?.recommended))}
            />
          );
        })}
      </div>
    </div>
  );
}
