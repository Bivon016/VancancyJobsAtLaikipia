import { useEffect, useState } from 'react';
import { BarChart3, Calendar, ClipboardList, Eye, FileText, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Select, Textarea } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import InterviewHeader from '../../components/interviews/InterviewHeader';
import QuestionEditorCard, { emptyQuestion, duplicateQuestion, validateQuestion } from '../../components/interviews/QuestionEditorCard';
import { applicationsApi, jobsApi } from '../../api';
import { interviewService } from '../../services/interviewService';
import { questionSetService } from '../../services/questionSetService';
import { questionBankService } from '../../services/questionBankService';
import { formatDateTime, getApplicantName } from '../../utils/constants';

const TABS = [
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'question-sets', label: 'Question Sets', icon: ClipboardList },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function OnlineInterviewsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    vacancyId: '',
    questionSetId: '',
    opensAt: '',
    closesAt: '',
    durationMinutes: '30',
  });
  const [questions, setQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [questionQuery, setQuestionQuery] = useState('');
  const [selectedQuestionBankSetId, setSelectedQuestionBankSetId] = useState('');
  const [questionError, setQuestionError] = useState('');
  const [questionCreateOpen, setQuestionCreateOpen] = useState(false);
  const [questionCreateError, setQuestionCreateError] = useState('');
  const [questionCreateMessage, setQuestionCreateMessage] = useState('');
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [questionForms, setQuestionForms] = useState([emptyQuestion()]);
  const [sets, setSets] = useState([]);
  const [setsLoading, setSetsLoading] = useState(true);
  const [setsError, setSetsError] = useState('');
  const [questionSetCreateOpen, setQuestionSetCreateOpen] = useState(false);
  const [questionSetCreateError, setQuestionSetCreateError] = useState('');
  const [questionSetCreateMessage, setQuestionSetCreateMessage] = useState('');
  const [questionSetSubmitting, setQuestionSetSubmitting] = useState(false);
  const [questionSetForm, setQuestionSetForm] = useState({
    title: '',
    description: '',
    vacancyId: '',
  });
  const [vacancies, setVacancies] = useState([]);
  const [vacanciesLoading, setVacanciesLoading] = useState(false);
  const handleSelectQuestionSet = (setId) => {
    setSelectedQuestionBankSetId(String(setId));
    setQuestionCreateError('');
    setQuestionCreateMessage('');
  };
  const [vacanciesError, setVacanciesError] = useState('');
  const [stats, setStats] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const [interviewsResult, applicationsResult, questionSetsResult] = await Promise.all([
        interviewService.getAll(),
        applicationsApi.getAll(),
        questionSetService.getAll(),
      ]);
      setInterviews(Array.isArray(interviewsResult.data) ? interviewsResult.data : []);
      setApplications(Array.isArray(applicationsResult.data) ? applicationsResult.data : []);
      setQuestionSets(Array.isArray(questionSetsResult.data) ? questionSetsResult.data : []);
      await loadVacancies();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load interview data.');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionSetsForVacancy = async (vacancyId) => {
    try {
      setQuestionLoading(true);
      const { data } = await questionSetService.getByVacancy(vacancyId);
      setQuestionSets(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuestionError(err.response?.data?.message || 'Unable to load question sets for this vacancy.');
    } finally {
      setQuestionLoading(false);
    }
  };

  const loadQuestionBank = async () => {
    try {
      setQuestionLoading(true);
      if (!selectedQuestionBankSetId) {
        setQuestions([]);
        return;
      }
      const { data } = await questionSetService.getById(selectedQuestionBankSetId);
      const items = Array.isArray(data.items) ? data.items : [];
      setQuestions(
        items.map((item) => ({
          ...item.question,
          required: item.required,
          marks: item.marks,
          itemId: item.itemId,
          orderIndex: item.orderIndex,
        }))
      );
    } catch (err) {
      setQuestionError(err.response?.data?.message || 'Unable to load questions for the selected set.');
    } finally {
      setQuestionLoading(false);
    }
  };

  const loadQuestionSets = async () => {
    try {
      setSetsLoading(true);
      const { data } = await questionSetService.getAll();
      setSets(Array.isArray(data) ? data : []);
    } catch (err) {
      setSetsError(err.response?.data?.message || 'Unable to load question sets.');
    } finally {
      setSetsLoading(false);
    }
  };

  const loadVacancies = async () => {
    try {
      setVacanciesLoading(true);
      const { data } = await jobsApi.getAllOpen();
      setVacancies(Array.isArray(data) ? data : []);
    } catch (err) {
      setVacanciesError(err.response?.data?.message || 'Unable to load vacancies.');
    } finally {
      setVacanciesLoading(false);
    }
  };

  const openCreateSetModal = async () => {
    setQuestionSetCreateError('');
    setQuestionSetCreateMessage('');
    setQuestionSetCreateOpen(true);
    await loadVacancies();
  };

  const handleCreateQuestionSet = async (event) => {
    event.preventDefault();
    setQuestionSetCreateError('');
    setQuestionSetCreateMessage('');

    if (!questionSetForm.title.trim() || !questionSetForm.vacancyId) {
      setQuestionSetCreateError('Title and vacancy selection are required.');
      return;
    }

    try {
      setQuestionSetSubmitting(true);
      await questionSetService.create({
        title: questionSetForm.title.trim(),
        description: questionSetForm.description.trim() || null,
        vacancyId: Number(questionSetForm.vacancyId),
      });
      setQuestionSetCreateMessage('Question set created successfully.');
      setQuestionSetCreateOpen(false);
      setQuestionSetForm({ title: '', description: '', vacancyId: '' });
      await loadQuestionSets();
    } catch (err) {
      setQuestionSetCreateError(err.response?.data?.message || 'Unable to create the question set.');
    } finally {
      setQuestionSetSubmitting(false);
    }
  };


  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [interviewsResult, questionsResult, setsResult] = await Promise.all([
        interviewService.getAll(),
        questionBankService.getAll({}),
        questionSetService.getAll(),
      ]);

      const interviews = Array.isArray(interviewsResult.data) ? interviewsResult.data : [];
      const questions = Array.isArray(questionsResult.data) ? questionsResult.data : [];
      const setsData = Array.isArray(setsResult.data) ? setsResult.data : [];
      const publishedSets = setsData.filter((setItem) => setItem.published).length;
      const totalQuestionsInSets = setsData.reduce((sum, setItem) => sum + (setItem.items?.length || 0), 0);

      setStats({
        totalInterviews: interviews.length,
        totalQuestions: questions.length,
        totalSets: setsData.length,
        publishedSets,
        questionsInSets: totalQuestionsInSets,
        averageQuestionsPerSet: setsData.length ? Math.round(totalQuestionsInSets / setsData.length) : 0,
      });
    } catch (err) {
      setAnalyticsError('Unable to load analytics.');
      setStats(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const validateQuestionForms = () => {
    for (const question of questionForms) {
      const err = validateQuestion(question);
      if (err) return err;
    }
    return '';
  };

  const handleCreateQuestion = async (event) => {
    event.preventDefault();
    setQuestionCreateError('');
    setQuestionCreateMessage('');

    if (!selectedQuestionBankSetId) {
      setQuestionCreateError('Select a question set before creating questions.');
      return;
    }

    const validationError = validateQuestionForms();
    if (validationError) {
      setQuestionCreateError(validationError);
      return;
    }

    try {
      setQuestionSubmitting(true);
      const { data: createdQuestions } = await questionBankService.createBatch(
        questionForms.map((question) => ({
          questionText: question.questionText.trim(),
          questionType: question.questionType,
          defaultMarks: Number(question.defaultMarks) || 1,
          expectedAnswer: question.expectedAnswer.trim() || null,
          markingGuide: question.markingGuide.trim() || null,
          difficultyLevel: question.difficultyLevel,
          required: question.required,
          options: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CHECKBOX'].includes(question.questionType)
            ? question.options.map((o) => ({ optionText: o.optionText.trim(), correct: o.correct }))
            : null,
        }))
      );

      await Promise.all(
        createdQuestions.map((question) =>
          questionSetService.addQuestion(selectedQuestionBankSetId, {
            questionId: question.id,
            marks: question.defaultMarks,
            required: question.required,
          })
        )
      );

      setQuestionCreateMessage('Questions created and added to the selected set successfully.');
      setQuestionCreateOpen(false);
      setQuestionForms([emptyQuestion()]);
      await loadQuestionBank();
      await loadQuestionSets();
    } catch (err) {
      setQuestionCreateError(err.response?.data?.message || 'Unable to create questions.');
    } finally {
      setQuestionSubmitting(false);
    }
  };

  useEffect(() => {
    void loadScheduleData();
  }, []);

  useEffect(() => {
    if (activeTab === 'question-sets') {
      void loadQuestionBank();
    }
  }, [activeTab, selectedQuestionBankSetId]);

  useEffect(() => {
    if (activeTab === 'question-sets') {
      void loadQuestionSets();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      void loadAnalytics();
    }
  }, [activeTab]);

  const handleSchedule = async (event) => {
    event.preventDefault();

    if (!form.vacancyId || !form.questionSetId || !form.opensAt || !form.closesAt) {
      setError('Select a vacancy, a question set, and both interview dates.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setMessage('');
      await interviewService.createForVacancy(Number(form.vacancyId), {
        questionSetId: Number(form.questionSetId),
        opensAt: form.opensAt,
        closesAt: form.closesAt,
        durationMinutes: Number(form.durationMinutes || 30),
      });
      setMessage('Online interview scheduled for all shortlisted applicants successfully.');
      setForm({
        vacancyId: '',
        questionSetId: '',
        opensAt: '',
        closesAt: '',
        durationMinutes: '30',
      });
      await loadScheduleData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to schedule the interview.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderTabs = () => (
    <div className="mb-8 flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setActiveTab(id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${
            activeTab === id
              ? 'bg-white text-secondary shadow-sm ring-1 ring-slate-200'
              : 'text-muted hover:text-secondary'
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );

  const renderScheduleTab = () => {
    const availableQuestionSets = questionSets.filter(
      (questionSet) => !form.vacancyId || Number(questionSet.vacancyId) === Number(form.vacancyId)
    );

    return (
      <>
        <Card className="mb-6 border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
          <CardHeader
            title="Schedule online interview"
            subtitle="Choose a vacancy, select a question set, and schedule interviews. Scheduling will publish the selected set automatically."
          />

          <form onSubmit={handleSchedule} className="grid gap-4 md:grid-cols-2">
            <Select
              label="Vacancy"
              value={form.vacancyId}
              onChange={(event) => {
                const vacancyId = event.target.value;
                setForm({ ...form, vacancyId, questionSetId: '' });
                if (vacancyId) {
                  void loadQuestionSetsForVacancy(Number(vacancyId));
                } else {
                  void loadScheduleData();
                }
              }}
            >
              <option value="">Select vacancy</option>
              {vacancies.map((vacancy) => (
                <option key={vacancy.id} value={vacancy.id}>
                  {vacancy.title || 'Vacancy'}
                </option>
              ))}
            </Select>

            <Select
              label="Question set"
              value={form.questionSetId}
              onChange={(event) => setForm({ ...form, questionSetId: event.target.value })}
            >
              <option value="">Select question set</option>
              {availableQuestionSets.map((questionSet) => (
                <option key={questionSet.id} value={questionSet.id}>
                  {questionSet.title || 'Question set'}
                </option>
              ))}
            </Select>

            <Input
              label="Start time"
              type="datetime-local"
              value={form.opensAt}
              onChange={(event) => setForm({ ...form, opensAt: event.target.value })}
            />

            <Input
              label="End time"
              type="datetime-local"
              value={form.closesAt}
              onChange={(event) => setForm({ ...form, closesAt: event.target.value })}
            />

            <Input
              label="Duration (minutes)"
              type="number"
              min="15"
              value={form.durationMinutes}
              onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })}
            />

            <div className="flex items-end justify-end md:col-span-2">
              <Button
                type="submit"
                loading={submitting}
                disabled={submitting || !form.vacancyId || !form.questionSetId}
              >
                <PlusCircle className="h-4 w-4" />
                Schedule Interview
              </Button>
            </div>
          </form>

        {message && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </Card>

      <Card className="border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50">
        <CardHeader
          title="Scheduled online interviews"
          subtitle="Use these cards to open evaluation or result pages."
        />
        {interviews.length === 0 ? (
          <EmptyState title="No interviews yet" description="Scheduled online interviews will appear here." />
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <div key={interview.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{interview.vacancyTitle || 'Interview'}</p>
                    <h3 className="mt-2 font-heading text-xl font-bold text-primary">{interview.applicantName || 'Applicant'}</h3>
                    <p className="mt-2 text-sm text-muted">{interview.questionSetTitle || 'Question set'} • {formatDateTime(interview.opensAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/interviews/evaluate?interviewId=${interview.id}`)}>
                      <Eye className="h-4 w-4" />
                      Evaluate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/interviews/result?interviewId=${interview.id}`)}>
                      <FileText className="h-4 w-4" />
                      Result
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
  };

  const renderQuestionBankTab = () => {
    if (questionLoading) {
      return (
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      );
    }

    const selectedSet = questionSets.find((setItem) => String(setItem.id) === String(selectedQuestionBankSetId));

    return (
      <div>
        <Card>
          <CardHeader
            title="Question Bank"
            subtitle={
              selectedSet
                ? `Adding questions for set: ${selectedSet.title}`
                : 'Select a question set above to begin adding questions.'
            }
            action={
              <Button
                variant="primary"
                onClick={() => {
                  if (!selectedQuestionBankSetId) {
                    setQuestionCreateError('Select a question set before creating questions.');
                    return;
                  }
                  if (selectedSet?.published) {
                    setQuestionCreateError('Cannot add questions to a published set. Unpublish the set first.');
                    return;
                  }
                  setQuestionCreateOpen(true);
                  setQuestionCreateError('');
                  setQuestionCreateMessage('');
                }}
                disabled={!selectedQuestionBankSetId || selectedSet?.published}
              >
                Add questions to set
              </Button>
            }
          />
          {selectedSet && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              Create questions for this set; scheduling it will publish it automatically for shortlisted applicants. Published sets are locked for editing until unpublished.
            </div>
          )}
        </Card>
        {questionCreateMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {questionCreateMessage}
          </div>
        )}
        {questionCreateOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8">
            <div className="mx-auto w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[24px] bg-slate-50 shadow-2xl">
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Create questions</h2>
                  <p className="mt-1 text-sm text-slate-500">Add as many as you need, then attach them to a set below.</p>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                  onClick={() => setQuestionCreateOpen(false)}
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleCreateQuestion} className="space-y-4 px-6 py-6">
                <Select
                  label="Add to question set"
                  value={selectedQuestionBankSetId}
                  onChange={(e) => setSelectedQuestionBankSetId(e.target.value)}
                >
                  <option value="">Select a question set...</option>
                  {questionSets.map((set) => (
                    <option key={set.id} value={set.id}>
                      {set.title}
                    </option>
                  ))}
                </Select>

                {questionForms.map((question, index) => (
                  <QuestionEditorCard
                    key={index}
                    question={question}
                    index={index + 1}
                    autoFocus={index === questionForms.length - 1 && questionForms.length > 1}
                    onChange={(next) =>
                      setQuestionForms((current) => current.map((item, idx) => (idx === index ? next : item)))
                    }
                    onDuplicate={() =>
                      setQuestionForms((current) => [
                        ...current.slice(0, index + 1),
                        duplicateQuestion(question),
                        ...current.slice(index + 1),
                      ])
                    }
                    onDelete={questionForms.length > 1 ? () => setQuestionForms((current) => current.filter((_, idx) => idx !== index)) : undefined}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => setQuestionForms((current) => [...current, emptyQuestion()])}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-primary hover:text-primary"
                >
                  <PlusCircle className="h-4 w-4" /> Add question
                </button>

                {questionCreateError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {questionCreateError}
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setQuestionCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={questionSubmitting} variant="primary">
                    Create {questionForms.length > 1 ? `${questionForms.length} questions` : 'question'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6">
          {questions.length === 0 ? (
            <Card>
              <EmptyState title="No questions" description="Create the first question to get started." />
            </Card>
          ) : (
            <div className="grid gap-4">
              {questions.map((q) => (
                <Card key={q.id} className="rounded-[24px] border p-4">
                  <h3 className="font-heading text-lg font-bold text-primary">{q.questionText}</h3>
                  <p className="mt-2 text-sm text-muted">{q.questionText}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">{q.questionType}</div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">{q.difficultyLevel}</div>
                    {q.required ? (
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">Required</div>
                    ) : (
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">Optional</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {questionError && <div className="mt-4 text-sm text-red-600">{questionError}</div>}
      </div>
    );
  };

  const renderQuestionSetsTab = () => {
    if (setsLoading) {
      return (
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      );
    }

    return (
      <div>
        <Card>
          <CardHeader
            title="Question Sets"
            subtitle="Build and manage your question papers for interviews."
            action={
              <Button variant="primary" onClick={openCreateSetModal}>
                Create set
              </Button>
            }
          />
        </Card>

        {questionSetCreateMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {questionSetCreateMessage}
          </div>
        )}

        {questionSetCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
            <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Create question set</h2>
                  <p className="mt-1 text-sm text-slate-500">Create a new question set and assign it to a vacancy.</p>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                  onClick={() => setQuestionSetCreateOpen(false)}
                >
                  Close
                </button>
              </div>
              <form onSubmit={handleCreateQuestionSet} className="space-y-5 px-6 py-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Input
                    label="Title"
                    placeholder="Set title"
                    value={questionSetForm.title}
                    onChange={(e) => setQuestionSetForm({ ...questionSetForm, title: e.target.value })}
                  />
                  <Select
                    label="Vacancy"
                    value={questionSetForm.vacancyId}
                    onChange={(e) => setQuestionSetForm({ ...questionSetForm, vacancyId: e.target.value })}
                  >
                    <option value="">Select vacancy</option>
                    {vacancies.map((vacancy) => (
                      <option key={vacancy.id} value={vacancy.id}>
                        {vacancy.title}
                      </option>
                    ))}
                  </Select>
                </div>

                <Textarea
                  label="Description"
                  placeholder="Optional description for this question set"
                  value={questionSetForm.description}
                  onChange={(e) => setQuestionSetForm({ ...questionSetForm, description: e.target.value })}
                />

                {questionSetCreateError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {questionSetCreateError}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setQuestionSetCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={questionSetSubmitting} variant="primary">
                    Create set
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Card>
            <div className="space-y-4 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Current question set</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Select the set you want to add questions to, then use the question bank below to build the content. Scheduling a set will publish it for shortlisted applicants.
                  </p>
                </div>
                <Button variant="primary" onClick={openCreateSetModal}>
                  Create set
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Select
                    label="Select question set"
                    value={selectedQuestionBankSetId}
                    onChange={(e) => handleSelectQuestionSet(e.target.value)}
                  >
                    <option value="">Choose set</option>
                    {sets.map((setItem) => (
                      <option key={setItem.id} value={setItem.id}>
                        {setItem.title} {setItem.published ? '(Published)' : '(Draft)'}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  {selectedQuestionBankSetId && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      {sets.find((setItem) => String(setItem.id) === String(selectedQuestionBankSetId))?.published
                        ? 'This set is published and cannot accept new questions.'
                        : 'This set is currently draft. Add questions below; it will publish when scheduled.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-10">
          {selectedQuestionBankSetId ? renderQuestionBankTab() : (
            <Card>
              <div className="p-6 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">No set selected yet</p>
                <p className="mt-2">
                  Choose a set from the dropdown above or create a new one. Once selected, you can add questions directly to that set. The set will publish when it is scheduled.
                </p>
              </div>
            </Card>
          )}
        </div>

        {setsError && <div className="mt-4 text-sm text-red-600">{setsError}</div>}
      </div>
    );
  };

  const renderAnalyticsTab = () => {
    if (analyticsLoading) {
      return (
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader title="Online interview analytics" subtitle="High level statistics and charts." />
        {stats ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Total interviews</p>
              <p className="mt-2 text-2xl font-bold text-primary">{stats.totalInterviews}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Total questions</p>
              <p className="mt-2 text-2xl font-bold text-primary">{stats.totalQuestions}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Question sets</p>
              <p className="mt-2 text-2xl font-bold text-primary">{stats.totalSets}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Published sets</p>
              <p className="mt-2 text-2xl font-bold text-primary">{stats.publishedSets}</p>
            </div>
          </div>
        ) : (
          <EmptyState title="No analytics" description="No data available." />
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Questions in sets</p>
            <p className="mt-2 text-2xl font-bold text-primary">{stats?.questionsInSets ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Avg questions/set</p>
            <p className="mt-2 text-2xl font-bold text-primary">{stats?.averageQuestionsPerSet ?? '—'}</p>
          </div>
        </div>
        {analyticsError && <div className="mt-4 text-sm text-red-600">{analyticsError}</div>}
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <InterviewHeader
        title="Online interviews"
        subtitle="Schedule online sessions, manage your question bank, build question sets, and view analytics from one place."
        meta={[{ label: 'Module', value: 'Online interviews', icon: 'user' }, { label: 'Active tab', value: activeTab.replace('-', ' '), icon: 'clock' }]}
      />

      {renderTabs()}

      {activeTab === 'schedule' && renderScheduleTab()}
      {activeTab === 'question-sets' && renderQuestionSetsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
    </div>
  );
}
