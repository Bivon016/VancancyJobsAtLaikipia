import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  palette,
  fontDisplay,
  fontBody,
  fontMono,
  PageShell,
  Stamp,
  statusTone,
  Spinner,
} from "../../utils/designSystem.jsx";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { jobsApi, interviewQuestionsApi } from "../../api";

/**
 * VacancyQuestionsPage - Panel members manage questions for a vacancy (shared by all interviews for that vacancy)
 */
const QUESTION_TYPES = [
  { value: "ESSAY", label: "Essay / long answer" },
  { value: "SHORT_ANSWER", label: "Short answer" },
  { value: "MULTIPLE_CHOICE", label: "Single-select (radio)" },
  { value: "MULTI_SELECT", label: "Multi-select (checkbox)" },
  { value: "YES_NO", label: "Yes / No" },
];

const blankQuestionDraft = () => ({
  questionText: "",
  questionType: "ESSAY",
  options: "",
  required: true,
  correctAnswer: "",
  modelAnswer: "",
  markingRubric: "",
  maxScore: "100",
});

export function VacancyQuestionsPage() {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [questionDrafts, setQuestionDrafts] = useState([blankQuestionDraft()]);

  useEffect(() => {
    loadVacancies();
  }, []);

  useEffect(() => {
    if (selectedVacancy) {
      loadQuestionsForVacancy(selectedVacancy.id);
    }
  }, [selectedVacancy]);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      const res = await jobsApi.getAllOpen();
      setVacancies((res.data || []).map((vacancy) => ({
        id: vacancy.id,
        title: vacancy.title,
        department: vacancy.department?.departmentName || "Department",
      })));
      if ((res.data || []).length > 0) {
        setSelectedVacancy((prev) => prev || {
          id: res.data[0].id,
          title: res.data[0].title,
          department: res.data[0].department?.departmentName || "Department",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vacancies");
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForVacancy = async (vacancyId) => {
    try {
      const res = await interviewQuestionsApi.getForVacancy(vacancyId);
      setQuestions((res.data || []).map((question) => ({
        id: question.id,
        questionText: question.questionText,
        status: question.status,
        createdBy: question.createdByName || "Panel Member",
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDraft = () => setQuestionDrafts((prev) => [...prev, blankQuestionDraft()]);

  const handleRemoveDraft = (index) => {
    setQuestionDrafts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateDraft = (index, field, value) => {
    setQuestionDrafts((prev) =>
      prev.map((draft, idx) =>
        idx === index ? { ...draft, [field]: value } : draft
      )
    );
  };

  const handleSubmitQuestions = async () => {
    const payload = questionDrafts.map((draft) => ({
      vacancyId: selectedVacancy.id,
      questionText: draft.questionText,
      questionType: draft.questionType,
      options:
        draft.questionType === "MULTIPLE_CHOICE" || draft.questionType === "MULTI_SELECT"
          ? draft.options
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          : undefined,
      required: draft.required,
      correctAnswer: draft.correctAnswer,
      modelAnswer: draft.modelAnswer,
      markingRubric: draft.markingRubric,
      maxScore: parseInt(draft.maxScore, 10) || 100,
    }));

    for (let i = 0; i < payload.length; i += 1) {
      const draft = questionDrafts[i];
      if (!draft.questionText.trim()) {
        setError(`Question ${i + 1}: text is required.`);
        return;
      }
      if (
        (draft.questionType === "MULTIPLE_CHOICE" || draft.questionType === "MULTI_SELECT") &&
        !draft.options.trim()
      ) {
        setError(`Question ${i + 1}: provide at least one option for this question type.`);
        return;
      }
      if (
        (draft.questionType === "MULTIPLE_CHOICE" ||
          draft.questionType === "MULTI_SELECT" ||
          draft.questionType === "YES_NO") &&
        !draft.correctAnswer.trim()
      ) {
        setError(`Question ${i + 1}: correct answer is required for this type.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      await interviewQuestionsApi.postVacancyQuestionsBatch(payload);

      setQuestionDrafts([blankQuestionDraft()]);
      await loadQuestionsForVacancy(selectedVacancy.id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit questions");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await interviewQuestionsApi.delete(questionId);
      await loadQuestionsForVacancy(selectedVacancy.id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  };

  if (loading) {
    return (
      <PageShell
        eyebrow="Panel Member"
        title="Question Bank"
        subtitle="Manage questions for each vacancy (shared by all interviews)"
      >
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spinner />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Panel Member"
      title="Question Bank"
      subtitle="Manage questions for each vacancy (shared by all interviews)"
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", marginTop: 24 }}>
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
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Vacancy Selector */}
        <div style={{ marginBottom: 24 }}>
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
            Select Vacancy
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {vacancies.map((vac) => (
              <button
                key={vac.id}
                onClick={() => setSelectedVacancy(vac)}
                style={{
                  padding: 14,
                  background:
                    selectedVacancy?.id === vac.id ? palette.gold : palette.raised,
                  color:
                    selectedVacancy?.id === vac.id ? palette.ink : palette.parchment,
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 13.5 }}>{vac.title}</div>
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                    marginTop: 4,
                  }}
                >
                  {vac.department}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedVacancy && (
          <>
            {/* Question Composer Form */}
            <div
              style={{
                background: palette.panel,
                border: `1px solid ${palette.hairline}`,
                borderRadius: 8,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  fontFamily: fontDisplay,
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                Add Question to {selectedVacancy.title}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {questionDrafts.map((draft, index) => (
                  <div
                    key={index}
                    style={{
                      background: palette.raised,
                      border: `1px solid ${palette.hairline}`,
                      borderRadius: 8,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: palette.gold,
                            marginBottom: 4,
                          }}
                        >
                          Question {index + 1}
                        </div>
                        <select
                          value={draft.questionType}
                          onChange={(e) => updateDraft(index, "questionType", e.target.value)}
                          style={{
                            width: 240,
                            padding: 10,
                            fontFamily: fontMono,
                            fontSize: 13.5,
                            background: palette.raised,
                            border: `1px solid ${palette.hairline}`,
                            borderRadius: 6,
                            color: palette.parchment,
                          }}
                        >
                          {QUESTION_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraft(index)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: palette.red,
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: "grid", gap: 16 }}>
                      <div>
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
                          value={draft.questionText}
                          onChange={(e) => updateDraft(index, "questionText", e.target.value)}
                          placeholder="What would you like to ask?"
                          style={{
                            width: "100%",
                            minHeight: 80,
                            padding: 10,
                            fontFamily: fontBody,
                            fontSize: 13.5,
                            background: palette.raised,
                            border: `1px solid ${palette.hairline}`,
                            borderRadius: 6,
                            color: palette.parchment,
                            resize: "vertical",
                          }}
                        />
                      </div>

{(draft.questionType === "MULTIPLE_CHOICE" ||
                      draft.questionType === "MULTI_SELECT" ||
                      draft.questionType === "YES_NO") && (
                      <div>
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
                          Correct Answer
                        </label>
                        <input
                          value={draft.correctAnswer}
                          onChange={(e) => updateDraft(index, "correctAnswer", e.target.value)}
                          placeholder={
                            draft.questionType === "YES_NO"
                              ? "Yes or No"
                              : draft.questionType === "MULTI_SELECT"
                              ? "Enter one or more correct options, separated by commas"
                                : "Correct option text"
                            }
                            style={{
                              width: "100%",
                              padding: 10,
                              fontFamily: fontMono,
                              fontSize: 13.5,
                              background: palette.raised,
                              border: `1px solid ${palette.hairline}`,
                              borderRadius: 6,
                              color: palette.parchment,
                            }}
                          />
                        </div>
                      )}

{(draft.questionType === "MULTIPLE_CHOICE" ||
                      draft.questionType === "MULTI_SELECT") && (
                        <div>
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
                            Options
                          </label>
                          <textarea
                            value={draft.options}
                            onChange={(e) => updateDraft(index, "options", e.target.value)}
                            placeholder="Enter each option on a separate line"
                            style={{
                              width: "100%",
                              minHeight: 80,
                              padding: 10,
                              fontFamily: fontBody,
                              fontSize: 13.5,
                              background: palette.raised,
                              border: `1px solid ${palette.hairline}`,
                              borderRadius: 6,
                              color: palette.parchment,
                              resize: "vertical",
                            }}
                          />
                        </div>
                      )}

                      <div>
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
                          Model Answer (not visible to applicants)
                        </label>
                        <textarea
                          value={draft.modelAnswer}
                          onChange={(e) => updateDraft(index, "modelAnswer", e.target.value)}
                          placeholder="Ideal answer for reference..."
                          style={{
                            width: "100%",
                            minHeight: 80,
                            padding: 10,
                            fontFamily: fontBody,
                            fontSize: 13.5,
                            background: palette.raised,
                            border: `1px solid ${palette.hairline}`,
                            borderRadius: 6,
                            color: palette.parchment,
                            resize: "vertical",
                          }}
                        />
                      </div>

                      <div>
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
                          Marking Rubric (for LLM scoring)
                        </label>
                        <textarea
                          value={draft.markingRubric}
                          onChange={(e) => updateDraft(index, "markingRubric", e.target.value)}
                          placeholder="Score: 90-100 if answer includes X, Y, Z. 70-89 if includes X and Y, etc."
                          style={{
                            width: "100%",
                            minHeight: 80,
                            padding: 10,
                            fontFamily: fontBody,
                            fontSize: 13.5,
                            background: palette.raised,
                            border: `1px solid ${palette.hairline}`,
                            borderRadius: 6,
                            color: palette.parchment,
                            resize: "vertical",
                          }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
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
                            Max Score
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={draft.maxScore}
                            onChange={(e) => updateDraft(index, "maxScore", e.target.value)}
                            style={{
                              width: "100%",
                              padding: 10,
                              fontFamily: fontMono,
                              fontSize: 13.5,
                              background: palette.raised,
                              border: `1px solid ${palette.hairline}`,
                              borderRadius: 6,
                              color: palette.parchment,
                            }}
                          />
                        </div>
                        <div>
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
                            Required
                          </label>
                          <select
                            value={draft.required ? "true" : "false"}
                            onChange={(e) =>
                              updateDraft(index, "required", e.target.value === "true")
                            }
                            style={{
                              width: "100%",
                              padding: 10,
                              fontFamily: fontMono,
                              fontSize: 13.5,
                              background: palette.raised,
                              border: `1px solid ${palette.hairline}`,
                              borderRadius: 6,
                              color: palette.parchment,
                            }}
                          >
                            <option value="true">Required</option>
                            <option value="false">Optional</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddDraft}
                  style={{
                    alignSelf: "flex-start",
                    padding: "10px 20px",
                    background: palette.gold,
                    color: palette.ink,
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Add Another Question
                </button>
              </div>

              <button
                onClick={handleSubmitQuestions}
                disabled={submitting}
                style={{
                  marginTop: 20,
                  width: "100%",
                  padding: "12px 24px",
                  background: palette.gold,
                  color: palette.ink,
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Adding..." : "+ Add Questions"}
              </button>
            </div>

            {/* Questions List */}
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
                  marginBottom: 16,
                }}
              >
                Questions for {selectedVacancy.title}
              </h2>

              {questions.length === 0 ? (
                <p style={{ color: palette.slate, textAlign: "center", padding: 20 }}>
                  No questions added yet
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        background: palette.raised,
                        border: `1px solid ${palette.hairline}`,
                        borderRadius: 6,
                        padding: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontWeight: 600,
                            color: palette.parchment,
                          }}
                        >
                          {q.questionText}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <Stamp tone={statusTone(q.status)}>{q.status}</Stamp>
                          <span style={{ fontSize: 12, color: palette.slate }}>
                            • {q.createdBy}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={{
                          padding: 8,
                          background: "transparent",
                          border: "none",
                          color: palette.red,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

export default VacancyQuestionsPage;
