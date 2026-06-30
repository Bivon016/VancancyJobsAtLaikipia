import React, { useState, useEffect, useRef } from "react";
import {
  palette,
  fontDisplay,
  fontBody,
  fontMono,
  PageShell,
  Stamp,
  statusTone,
  Spinner,
  CenteredNotice,
  formatClock,
} from "../../utils/designSystem.jsx";
import {
  interviewQuestionsApi,
  interviewAnswersApi,
  examSessionApi,
} from "../../api";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
} from "lucide-react";

export function ApplicantExamSession({ interview, onComplete }) {
  const [state, setState] = useState("LANDING"); // LANDING | ACTIVE | COMPLETED
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // questionId -> {answerText, score, feedback, scoreStatus}
  const [draftAnswers, setDraftAnswers] = useState({}); // questionId -> draft answerText
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [submittingQuestionId, setSubmittingQuestionId] = useState(null);
  const timerRef = useRef(null);
  const autoSubmitRef = useRef(null);

  // Load interview state and questions on mount
  useEffect(() => {
    loadInitialState();
  }, [interview.id]);

  const loadInitialState = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if exam has already started
      if (interview.examStartedAt && interview.status === "IN_PROGRESS") {
        // Resume active exam
        setState("ACTIVE");
        setDeadline(new Date(interview.deadline));
      } else {
        setState("LANDING");
      }

      // Load questions
      const qRes = await interviewQuestionsApi.getForInterview(interview.id);
      const questionsData = qRes.data || [];
      setQuestions(questionsData);

      // Load existing answers
      try {
        const aRes = await interviewAnswersApi.getForInterview(interview.id);
        const answersData = aRes.data || [];
        const answersMap = {};
        answersData.forEach((a) => {
          answersMap[a.questionId] = {
            answerText: a.answerText,
            score: a.score,
            feedback: a.feedback,
            scoreStatus: a.scoreStatus,
          };
        });
        setAnswers(answersMap);
      } catch (err) {
        // It's OK if there are no answers yet
        console.log("No answers yet", err);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load exam");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (state !== "ACTIVE" || !deadline) {
      return;
    }

    const tick = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const remaining = deadlineTime - now;

      if (remaining <= 0) {
        // Time's up
        handleTimeExpired();
      } else {
        setTimeLeft(remaining);
      }
    };

    tick(); // Call once immediately
    timerRef.current = setInterval(tick, 1000);

    return () => clearInterval(timerRef.current);
  }, [state, deadline]);

  const handleStartExam = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await examSessionApi.startExam(interview.id);
      setDeadline(new Date(res.data.deadline));
      setState("ACTIVE");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start exam");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeExpired = async () => {
    setState("COMPLETED");
    if (timerRef.current) clearInterval(timerRef.current);

    // Auto-submit any draft answers
    const draftsToSubmit = Object.keys(draftAnswers)
      .filter((qId) => !answers[qId]) // Only if not already submitted
      .map((qId) => ({
        questionId: parseInt(qId),
        answerText: serializeDraftValue(draftAnswers[qId]),
      }));

    if (draftsToSubmit.length > 0) {
      try {
        await examSessionApi.autoSubmitRemaining(interview.id, draftsToSubmit);
      } catch (err) {
        console.error("Auto-submit failed (backend has backstop)", err);
      }
    }

    if (onComplete) onComplete();
  };

  const handleSubmitAnswer = async (questionId, questionType) => {
    const draftValue = draftAnswers[questionId];
    const answerText = Array.isArray(draftValue)
      ? draftValue.join(", ")
      : draftValue || "";

    if (questionType === "MULTI_SELECT") {
      if (!Array.isArray(draftValue) || draftValue.length === 0) {
        setError("Please select at least one option before submitting.");
        return;
      }
    } else if (!answerText.trim()) {
      setError("Answer cannot be empty");
      return;
    }

    try {
      setSubmittingQuestionId(questionId);
      setError(null);
      const res = await interviewAnswersApi.submitAnswer({
        questionId,
        answerText,
      });
      // Store the result
      setAnswers({
        ...answers,
        [questionId]: {
          answerText: res.data.answerText,
          score: res.data.score,
          feedback: res.data.feedback,
          scoreStatus: res.data.scoreStatus,
        },
      });
      // Clear draft
      const newDrafts = { ...draftAnswers };
      delete newDrafts[questionId];
      setDraftAnswers(newDrafts);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit answer");
      console.error(err);
    } finally {
      setSubmittingQuestionId(null);
    }
  };

  const serializeDraftValue = (value) =>
    Array.isArray(value) ? value.join(", ") : value || "";

  const updateDraft = (questionId, value) => {
    setDraftAnswers({ ...draftAnswers, [questionId]: value });
  };

  const toggleMultiSelectOption = (questionId, option) => {
    const existing = draftAnswers[questionId] || [];
    const currentSelections = Array.isArray(existing)
      ? existing
      : existing.toString().split(",").map((item) => item.trim()).filter(Boolean);

    const nextSelections = currentSelections.includes(option)
      ? currentSelections.filter((item) => item !== option)
      : [...currentSelections, option];

    setDraftAnswers({ ...draftAnswers, [questionId]: nextSelections });
  };

  const isOptionSelected = (questionId, option) => {
    const existing = draftAnswers[questionId];
    const selections = Array.isArray(existing)
      ? existing
      : existing?.toString().split(",").map((item) => item.trim()).filter(Boolean) || [];
    return selections.includes(option);
  };

  const getDraftText = (questionId) => serializeDraftValue(draftAnswers[questionId]);

  const renderAnswerInput = (question, draftValue, isSubmitting) => {
    const defaultText = getDraftText(question.id);

    if (question.questionType === "MULTIPLE_CHOICE" || question.questionType === "YES_NO") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(question.options || (question.questionType === "YES_NO" ? ["Yes", "No"] : [])).map((option) => (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 12,
                background: palette.raised,
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={defaultText === option}
                disabled={isSubmitting}
                onChange={() => updateDraft(question.id, option)}
              />
              <span style={{ fontSize: 14, color: palette.parchment }}>{option}</span>
            </label>
          ))}
          <button
            onClick={() => handleSubmitAnswer(question.id, question.questionType)}
            disabled={isSubmitting || !defaultText.trim()}
            style={{
              marginTop: 12,
              padding: "10px 20px",
              background: palette.gold,
              color: palette.ink,
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13.5,
              cursor: isSubmitting || !defaultText.trim() ? "not-allowed" : "pointer",
              opacity: isSubmitting || !defaultText.trim() ? 0.6 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isSubmitting ? (
              <>
                <Spinner /> Grading...
              </>
            ) : (
              "Submit Answer"
            )}
          </button>
        </div>
      );
    }

    if (question.questionType === "MULTI_SELECT") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(question.options || []).map((option) => (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 12,
                background: palette.raised,
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                value={option}
                checked={isOptionSelected(question.id, option)}
                disabled={isSubmitting}
                onChange={() => toggleMultiSelectOption(question.id, option)}
              />
              <span style={{ fontSize: 14, color: palette.parchment }}>{option}</span>
            </label>
          ))}
          <button
            onClick={() => handleSubmitAnswer(question.id, question.questionType)}
            disabled={
              isSubmitting ||
              !Array.isArray(draftAnswers[question.id]) ||
              draftAnswers[question.id].length === 0
            }
            style={{
              marginTop: 12,
              padding: "10px 20px",
              background: palette.gold,
              color: palette.ink,
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13.5,
              cursor:
                isSubmitting ||
                !Array.isArray(draftAnswers[question.id]) ||
                draftAnswers[question.id].length === 0
                  ? "not-allowed"
                  : "pointer",
              opacity:
                isSubmitting ||
                !Array.isArray(draftAnswers[question.id]) ||
                draftAnswers[question.id].length === 0
                  ? 0.6
                  : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isSubmitting ? (
              <>
                <Spinner /> Grading...
              </>
            ) : (
              "Submit Answer"
            )}
          </button>
        </div>
      );
    }

    const showShortAnswer = question.questionType === "SHORT_ANSWER";

    return (
      <div>
        <textarea
          value={defaultText}
          onChange={(e) => updateDraft(question.id, e.target.value)}
          disabled={isSubmitting}
          style={{
            width: "100%",
            minHeight: showShortAnswer ? 60 : 120,
            fontFamily: fontBody,
            fontSize: 13.5,
            padding: 12,
            background: palette.raised,
            border: `1px solid ${palette.hairline}`,
            borderRadius: 6,
            color: palette.parchment,
            resize: "vertical",
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? "not-allowed" : "auto",
          }}
          placeholder={
            showShortAnswer
              ? "Type your concise answer here..."
              : "Type your answer here..."
        }
        />
        <button
          onClick={() => handleSubmitAnswer(question.id, question.questionType)}
          disabled={isSubmitting || !defaultText.trim()}
          style={{
            marginTop: 12,
            padding: "10px 20px",
            background: palette.gold,
            color: palette.ink,
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13.5,
            cursor: isSubmitting || !defaultText.trim() ? "not-allowed" : "pointer",
            opacity: isSubmitting || !defaultText.trim() ? 0.6 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {isSubmitting ? (
            <>
              <Spinner /> Grading...
            </>
          ) : (
            "Submit Answer"
          )}
        </button>
      </div>
    );
  };

  // Render based on state
  if (loading && state === "LANDING") {
    return (
      <PageShell eyebrow="Applicant" title="Exam Session" subtitle={interview.vacancyTitle}>
        <CenteredNotice
          icon={<Spinner />}
          title="Loading Exam..."
          body="Please wait while we prepare your interview."
        />
      </PageShell>
    );
  }

  if (state === "LANDING") {
    return (
      <PageShell eyebrow="Applicant" title="Exam Session" subtitle={interview.vacancyTitle}>
        <div style={{ maxWidth: 600, margin: "0 auto", marginTop: 40 }}>
          <div
            style={{
              background: palette.panel,
              border: `1px solid ${palette.hairline}`,
              borderRadius: 8,
              padding: 32,
              textAlign: "center",
            }}
          >
            <h2 style={{ fontFamily: fontDisplay, fontSize: 22, marginBottom: 16 }}>
              Ready to Begin Your Interview?
            </h2>
            <div
              style={{
                background: palette.raised,
                borderRadius: 6,
                padding: 20,
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: palette.gold,
                    marginBottom: 4,
                  }}
                >
                  Vacancy
                </span>
                <p style={{ margin: 0, fontSize: 14 }}>{interview.vacancyTitle}</p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: palette.gold,
                    marginBottom: 4,
                  }}
                >
                  Duration
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontFamily: fontMono,
                  }}
                >
                  {interview.durationMinutes} minutes
                </p>
              </div>
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: palette.gold,
                    marginBottom: 4,
                  }}
                >
                  Questions
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontFamily: fontMono,
                  }}
                >
                  {questions.length} total
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: 13.5,
                color: palette.slate,
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              Once you start, a countdown timer will begin. You will have{" "}
              <strong>{interview.durationMinutes} minutes</strong> to answer all questions. Any
              unanswered questions will be auto-submitted when time runs out.
            </p>

            {error && (
              <div
                style={{
                  background: "rgba(179,73,31,0.12)",
                  border: `1px solid ${palette.red}55`,
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 20,
                  display: "flex",
                  gap: 8,
                  fontSize: 13.5,
                  color: palette.parchment,
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleStartExam}
              disabled={loading}
              style={{
                padding: "12px 28px",
                background: palette.gold,
                color: palette.ink,
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <Spinner /> Starting...
                </>
              ) : (
                <>
                  <Play size={16} /> Start Exam
                </>
              )}
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  if (state === "ACTIVE" && deadline) {
    return (
      <PageShell
        eyebrow="Applicant"
        title="Interview Exam"
        subtitle={interview.vacancyTitle}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", marginTop: 24 }}>
          {/* Timer Bar */}
          <div
            style={{
              background:
                timeLeft && timeLeft < 5 * 60 * 1000
                  ? "rgba(179,73,31,0.12)"
                  : "rgba(201,162,75,0.12)",
              border: `1px solid ${
                timeLeft && timeLeft < 5 * 60 * 1000 ? palette.red : palette.gold
              }55`,
              borderRadius: 6,
              padding: 12,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Clock
              size={18}
              color={timeLeft && timeLeft < 5 * 60 * 1000 ? palette.red : palette.gold}
            />
            <span
              style={{
                flex: 1,
                fontFamily: fontMono,
                fontSize: 14,
                fontWeight: 600,
                color:
                  timeLeft && timeLeft < 5 * 60 * 1000
                    ? palette.red
                    : palette.gold,
              }}
            >
              Time Remaining: {formatClock(timeLeft || 0)}
            </span>
            {timeLeft && timeLeft < 5 * 60 * 1000 && (
              <span style={{ fontSize: 12, color: palette.red }}>Warning: Time running out</span>
            )}
          </div>

          {error && (
            <div
              style={{
                background: "rgba(179,73,31,0.12)",
                border: `1px solid ${palette.red}55`,
                borderRadius: 6,
                padding: 12,
                marginBottom: 20,
                display: "flex",
                gap: 8,
                fontSize: 13.5,
                color: palette.parchment,
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isSubmitting = submittingQuestionId === q.id;
              const draft = draftAnswers[q.id] ?? "";
              const submitted = answers[q.id];

              return (
                <div
                  key={q.id}
                  style={{
                    background: palette.panel,
                    border: `1px solid ${palette.hairline}`,
                    borderRadius: 8,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: fontMono,
                          fontSize: 12,
                          fontWeight: 600,
                          color: palette.gold,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Question {idx + 1}
                      </span>
                      <h3
                        style={{
                          fontFamily: fontDisplay,
                          fontSize: 16,
                          fontWeight: 600,
                          margin: "8px 0 0",
                          lineHeight: 1.5,
                        }}
                      >
                        {q.questionText}
                      </h3>
                    </div>
                    {isAnswered && (
                      <Stamp tone="green">Answered</Stamp>
                    )}
                  </div>

                  {isAnswered ? (
                    // Read-only submitted answer with score
                    <div style={{ background: palette.raised, borderRadius: 6, padding: 16 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: palette.slate,
                          marginBottom: 8,
                        }}
                      >
                        Your Answer
                      </div>
                      <p
                        style={{
                          fontFamily: fontBody,
                          fontSize: 13.5,
                          lineHeight: 1.6,
                          color: palette.parchment,
                          margin: 0,
                          marginBottom: 16,
                        }}
                      >
                        {submitted.answerText}
                      </p>

                      {submitted.scoreStatus === "SCORED" ? (
                        <>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 12,
                              padding: 12,
                              background: `rgba(46,107,79,0.1)`,
                              borderRadius: 4,
                            }}
                          >
                            <CheckCircle2 size={18} color={palette.green} />
                            <span style={{ fontFamily: fontMono, fontWeight: 600 }}>
                              Score: {submitted.score}/100
                            </span>
                          </div>
                          {submitted.feedback && (
                            <>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  color: palette.slate,
                                  marginBottom: 6,
                                }}
                              >
                                Feedback
                              </div>
                              <p
                                style={{
                                  fontSize: 13.5,
                                  lineHeight: 1.6,
                                  color: palette.slate,
                                  margin: 0,
                                }}
                              >
                                {submitted.feedback}
                              </p>
                            </>
                          )}
                        </>
                      ) : submitted.scoreStatus === "FAILED" ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: 12,
                            background: "rgba(179,73,31,0.12)",
                            border: `1px solid ${palette.red}55`,
                            borderRadius: 4,
                          }}
                        >
                          <XCircle size={18} color={palette.red} />
                          <span style={{ fontSize: 13.5 }}>
                            {submitted.feedback ||
                              "Automated scoring failed. Please notify the panel."}
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Spinner />
                          <span style={{ fontSize: 13.5, color: palette.slate }}>
                            Grading your response...
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    renderAnswerInput(q, draft, isSubmitting)
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </PageShell>
    );
  }

  if (state === "COMPLETED") {
    const answeredCount = Object.keys(answers).length;
    const allCount = questions.length;
    const totalScore = Object.values(answers).reduce(
      (sum, a) => (a.score !== null ? sum + a.score : sum),
      0
    );
    const scoredCount = Object.values(answers).filter((a) => a.scoreStatus === "SCORED").length;

    return (
      <PageShell eyebrow="Applicant" title="Exam Complete" subtitle={interview.vacancyTitle}>
        <div style={{ maxWidth: 600, margin: "0 auto", marginTop: 40 }}>
          <div
            style={{
              background: palette.panel,
              border: `1px solid ${palette.hairline}`,
              borderRadius: 8,
              padding: 32,
              textAlign: "center",
            }}
          >
            <CheckCircle2 size={64} color={palette.green} style={{ margin: "0 auto 24px" }} />
            <h2 style={{ fontFamily: fontDisplay, fontSize: 22, marginBottom: 8 }}>
              Time's Up!
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: palette.slate,
                marginBottom: 32,
                lineHeight: 1.6,
              }}
            >
              Your exam has been submitted. Thank you for participating in the interview process.
            </p>

            <div
              style={{
                background: palette.raised,
                borderRadius: 6,
                padding: 20,
                marginBottom: 24,
                textAlign: "left",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: palette.gold,
                    marginBottom: 4,
                  }}
                >
                  Answered
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontFamily: fontMono,
                    fontWeight: 600,
                  }}
                >
                  {answeredCount} / {allCount}
                </p>
              </div>
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: palette.gold,
                    marginBottom: 4,
                  }}
                >
                  Scored
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontFamily: fontMono,
                    fontWeight: 600,
                  }}
                >
                  {scoredCount} questions
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: 12,
                color: palette.slate,
                marginBottom: 0,
              }}
            >
              You will receive feedback shortly. The panel will review any remaining responses.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  return null;
}

export default ApplicantExamSession;
