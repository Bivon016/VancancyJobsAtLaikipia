import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { assessmentApi } from "../../api";

export default function AssessmentPage() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [availableAssessments, setAvailableAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(assessmentId || "");
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadAvailable = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await assessmentApi.getAvailable();
        const list = res.data || [];
        setAvailableAssessments(list);
        if (list.length > 0) {
          const firstId = assessmentId || String(list[0].id);
          setSelectedAssessmentId(firstId);
          if (firstId) {
            loadAssessment(firstId);
          }
        } else {
          setAssessment(null);
          setQuestions([]);
          setLoading(false);
        }
      } catch (err) {
        const message = err.response?.data?.message || "Unable to load available assessments";
        setError(message);
        setLoading(false);
      }
    };

    const loadAssessment = async (id) => {
      try {
        setLoading(true);
        const res = await assessmentApi.getForApplicant(id);
        const payload = res.data || [];
        if (Array.isArray(payload)) {
          setAssessment(payload[0]);
          setQuestions(payload[1] || []);
        } else {
          setAssessment(payload);
          setQuestions(payload.questions || []);
        }
      } catch (err) {
        const message = err.response?.data?.message || "Unable to load this assessment";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadAvailable();
  }, [assessmentId]);

  const allAnswered = useMemo(
    () =>
      questions.every((q) => {
        const value = answers[q.id];
        return typeof value === "string" && value.trim().length > 0;
      }),
    [answers, questions],
  );

  const updateAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = questions.map((q) => ({
        questionId: q.id,
        answerText: answers[q.id] || "",
      }));
      await assessmentApi.submitResponse(selectedAssessmentId, payload);
      setSubmitted(true);
    } catch (err) {
      const message = err.response?.data?.message || "Unable to submit assessment";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentChange = (event) => {
    const id = event.target.value;
    setSelectedAssessmentId(id);
    if (id) {
      navigate(`/assessment/${id}`, { replace: true });
    }
  };

  if (loading && !assessment) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Card>
          <p className="text-center text-sm text-slate-500">Loading assessment…</p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Card>
          <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Submitted
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Thank you — your response has been recorded</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Your submission has been saved successfully. You will not be able to make further changes.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate("/dashboard")}>Return to dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Card className="bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <div className="space-y-4">
          <div>
            <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Pre-screening assessment
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {assessment?.title || "Assessment"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {assessment?.instructions || "Please answer each question carefully."}
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="block w-full sm:w-auto">
              <span className="text-sm font-semibold text-slate-700">Select assessment</span>
              <select
                value={selectedAssessmentId}
                onChange={handleAssessmentChange}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                {availableAssessments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="text-sm text-slate-500">
              {availableAssessments.length} assessment{availableAssessments.length === 1 ? "" : "s"} available
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="mt-6 border border-rose-100 bg-rose-50 text-rose-700">
          <p>{error}</p>
        </Card>
      ) : null}

      <div className="mt-6 space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="bg-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                  Q{index + 1}
                </div>
                <div className="mt-3 text-base font-semibold text-slate-900">
                  {question.questionText}
                </div>
              </div>
              <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                {question.questionType.replace("_", " ")}
              </div>
            </div>

            {question.questionType === "SHORT_ANSWER" ? (
              <textarea
                value={answers[question.id] || ""}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                maxLength={500}
                className="mt-4 min-h-[140px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                placeholder="Type your answer here..."
              />
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                {(question.questionType === "TRUE_FALSE" ? ["TRUE", "FALSE"] : ["YES", "NO"]).map((option) => (
                  <label
                    key={option}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition hover:border-primary"
                  >
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      checked={answers[question.id] === option}
                      onChange={() => updateAnswer(question.id, option)}
                      className="h-4 w-4 rounded-full border-slate-300 text-primary focus:ring-primary"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          disabled={!allAnswered || loading}
          loading={loading}
          className="rounded-xl px-8"
          onClick={handleSubmit}
        >
          Submit assessment
        </Button>
      </div>
    </div>
  );
}

