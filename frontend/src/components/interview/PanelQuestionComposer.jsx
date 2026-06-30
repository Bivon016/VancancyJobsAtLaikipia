import React, { useState, useEffect } from "react";
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
} from "../../utils/designSystem.jsx";
import { interviewQuestionsApi } from "../../api";
import { Plus, Trash2, AlertCircle } from "lucide-react";

export function PanelQuestionComposer({ interviewId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [form, setForm] = useState({
    questionText: "",
    modelAnswer: "",
    markingRubric: "",
    maxScore: "100",
  });

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [interviewId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await interviewQuestionsApi.getForInterview(interviewId);
      setQuestions(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load questions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.questionText.trim()) {
      setError("Question text is required");
      return;
    }
    if (!form.modelAnswer.trim()) {
      setError("Model answer is required");
      return;
    }
    if (!form.markingRubric.trim()) {
      setError("Marking rubric is required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await interviewQuestionsApi.postQuestion({
        interviewId,
        questionText: form.questionText,
        modelAnswer: form.modelAnswer,
        markingRubric: form.markingRubric,
        maxScore: parseInt(form.maxScore) || 100,
      });
      // Reset form
      setForm({
        questionText: "",
        modelAnswer: "",
        markingRubric: "",
        maxScore: "100",
      });
      // Reload questions
      await loadQuestions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post question");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (questionId) => {
    try {
      setError(null);
      await interviewQuestionsApi.delete(questionId);
      await loadQuestions();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete question");
      console.error(err);
    }
  };

  return (
    <PageShell
      eyebrow="Panel"
      title="Question Composer"
      subtitle="Create interview questions. Model answer and rubric are only visible to panel."
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* Form Section */}
        <div
          style={{
            background: palette.panel,
            border: `1px solid ${palette.hairline}`,
            borderRadius: 8,
            padding: 24,
            marginTop: 32,
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontFamily: fontDisplay,
              fontSize: 18,
              fontWeight: 600,
              color: palette.gold,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={18} /> Post a New Question
          </h2>

          {error && (
            <div
              style={{
                background: "rgba(179,73,31,0.12)",
                border: `1px solid ${palette.red}55`,
                borderRadius: 6,
                padding: 12,
                marginBottom: 16,
                display: "flex",
                gap: 8,
                fontSize: 13.5,
                color: palette.parchment,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Question Text */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: palette.gold,
                  marginBottom: 8,
                }}
              >
                Question Text
              </label>
              <textarea
                value={form.questionText}
                onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                style={{
                  width: "100%",
                  minHeight: 100,
                  fontFamily: fontBody,
                  fontSize: 13.5,
                  padding: 12,
                  background: palette.raised,
                  border: `1px solid ${palette.hairline}`,
                  borderRadius: 6,
                  color: palette.parchment,
                  resize: "vertical",
                }}
                placeholder="What is your question?"
              />
            </div>

            {/* Model Answer */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: palette.gold,
                  marginBottom: 8,
                }}
              >
                Model Answer <span style={{ color: palette.slate }}>(not visible to applicant)</span>
              </label>
              <textarea
                value={form.modelAnswer}
                onChange={(e) => setForm({ ...form, modelAnswer: e.target.value })}
                style={{
                  width: "100%",
                  minHeight: 80,
                  fontFamily: fontBody,
                  fontSize: 13.5,
                  padding: 12,
                  background: palette.raised,
                  border: `1px solid ${palette.hairline}`,
                  borderRadius: 6,
                  color: palette.parchment,
                  resize: "vertical",
                }}
                placeholder="What is the ideal/expected answer?"
              />
            </div>

            {/* Marking Rubric */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: palette.gold,
                  marginBottom: 8,
                }}
              >
                Marking Rubric <span style={{ color: palette.slate }}>(for LLM scoring)</span>
              </label>
              <textarea
                value={form.markingRubric}
                onChange={(e) => setForm({ ...form, markingRubric: e.target.value })}
                style={{
                  width: "100%",
                  minHeight: 80,
                  fontFamily: fontBody,
                  fontSize: 13.5,
                  padding: 12,
                  background: palette.raised,
                  border: `1px solid ${palette.hairline}`,
                  borderRadius: 6,
                  color: palette.parchment,
                  resize: "vertical",
                }}
                placeholder="Award marks for: ... (criteria for scoring)"
              />
            </div>

            {/* Max Score */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: palette.gold,
                  marginBottom: 8,
                }}
              >
                Maximum Score
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                style={{
                  width: "100%",
                  fontFamily: fontMono,
                  fontSize: 13.5,
                  padding: 10,
                  background: palette.raised,
                  border: `1px solid ${palette.hairline}`,
                  borderRadius: 6,
                  color: palette.parchment,
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 20px",
                background: palette.gold,
                color: palette.ink,
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13.5,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {submitting ? (
                <>
                  <Spinner /> Posting...
                </>
              ) : (
                <>
                  <Plus size={16} /> Post Question
                </>
              )}
            </button>
          </form>
        </div>

        {/* Questions List Section */}
        <div
          style={{
            background: palette.panel,
            border: `1px solid ${palette.hairline}`,
            borderRadius: 8,
            padding: 24,
          }}
        >
          <h2
            style={{
              fontFamily: fontDisplay,
              fontSize: 18,
              fontWeight: 600,
              color: palette.parchment,
              marginBottom: 20,
            }}
          >
            Posted Questions
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spinner />
              <p style={{ color: palette.slate, marginTop: 12 }}>Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <CenteredNotice
              icon={
                <div
                  style={{
                    width: 56,
                    height: 56,
                    background: `rgba(201,162,75,0.1)`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertCircle size={28} color={palette.gold} />
                </div>
              }
              title="No Questions Yet"
              body="Post questions above to get started. Applicants will see only the question text, not the model answer or rubric."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    background: palette.raised,
                    border: `1px solid ${palette.hairline}`,
                    borderRadius: 6,
                    padding: 16,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fontMono,
                          fontSize: 11,
                          color: palette.slate,
                        }}
                      >
                        Q{idx + 1}
                      </span>
                      <Stamp tone={statusTone(q.status)}>{q.status}</Stamp>
                    </div>
                    <p
                      style={{
                        fontFamily: fontBody,
                        fontSize: 13.5,
                        color: palette.parchment,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {q.questionText}
                    </p>
                    <p
                      style={{
                        fontFamily: fontBody,
                        fontSize: 12,
                        color: palette.slate,
                        marginTop: 8,
                        margin: 0,
                      }}
                    >
                      Created by {q.createdByName}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    {!q.answered && (
                      <>
                        {deleteConfirm === q.id ? (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => handleDelete(q.id)}
                              style={{
                                padding: "6px 12px",
                                background: palette.red,
                                color: palette.parchment,
                                border: "none",
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={{
                                padding: "6px 12px",
                                background: palette.slate,
                                color: palette.parchment,
                                border: "none",
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(q.id)}
                            style={{
                              padding: "6px 10px",
                              background: `rgba(179,73,31,0.2)`,
                              border: `1px solid ${palette.red}55`,
                              borderRadius: 4,
                              color: palette.red,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default PanelQuestionComposer;
