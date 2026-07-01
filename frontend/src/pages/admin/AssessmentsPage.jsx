import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentApi, jobsApi } from "../../api";

export default function AssessmentsPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVacancyId, setSelectedVacancyId] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("SHORT_ANSWER");
  const [externalQuestionText, setExternalQuestionText] = useState("");
  const [importPreview, setImportPreview] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [questionViewer, setQuestionViewer] = useState({ assessment: null, questions: [] });
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    loadAssessments();
    loadVacancies();
  }, []);

  const loadAssessments = async () => {
    try {
      const res = await assessmentApi.getAll();
      setAssessments(res.data || []);
    } catch (err) {
      console.error("Unable to load assessments", err);
      setAssessments([]);
    }
  };

  const loadVacancies = async () => {
    try {
      const res = await jobsApi.getAll();
      setVacancies(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedVacancyId(String(res.data[0].id));
      }
    } catch (err) {
      console.error("Unable to load vacancies", err);
    }
  };

  const createAssessment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await assessmentApi.create({ vacancyId: Number(selectedVacancyId), title, instructions });
      setMessage("Assessment created successfully");
      setTitle("");
      setInstructions("");
      setShowCreateForm(false);
      loadAssessments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to create assessment");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    if (!selectedAssessment || !newQuestionText.trim()) return;
    try {
      setLoading(true);
      await assessmentApi.addQuestion(selectedAssessment.id, {
        questionText: newQuestionText,
        questionType: newQuestionType,
      });
      setMessage("Question added");
      setNewQuestionText("");
      loadAssessments();
      if (questionViewer.assessment?.id === selectedAssessment.id) {
        loadAssessmentQuestions(selectedAssessment.id);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to add question");
    } finally {
      setLoading(false);
    }
  };

  const loadAssessmentQuestions = async (assessmentId) => {
    try {
      setQuestionsLoading(true);
      const res = await assessmentApi.getForApplicant(assessmentId);
      const payload = res.data || [];
      const assessment = Array.isArray(payload) ? payload[0] : payload;
      const questions = Array.isArray(payload) ? payload[1] || [] : payload.questions || [];
      setQuestionViewer({ assessment, questions });
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to load questions");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const parseExternalQuestions = (text) =>
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

  const previewExternalQuestions = () => {
    const questions = parseExternalQuestions(externalQuestionText);
    setImportPreview(questions);
  };

  const importExternalQuestions = async () => {
    if (!selectedAssessment) {
      setMessage("Select a draft assessment before importing questions.");
      return;
    }
    const questions = parseExternalQuestions(externalQuestionText);
    if (questions.length === 0) {
      setMessage("Paste at least one question before importing.");
      return;
    }

    try {
      setImportLoading(true);
      for (const questionText of questions) {
        await assessmentApi.addQuestion(selectedAssessment.id, {
          questionText,
          questionType: newQuestionType,
        });
      }
      setMessage(`${questions.length} questions imported successfully`);
      setExternalQuestionText("");
      setImportPreview([]);
      loadAssessments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to import external questions");
    } finally {
      setImportLoading(false);
    }
  };

  const activateAssessment = async (assessmentId) => {
    try {
      setLoading(true);
      await assessmentApi.activate(assessmentId);
      setMessage("Assessment activated - emails sent to shortlisted applicants");
      loadAssessments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to activate assessment");
    } finally {
      setLoading(false);
    }
  };

  const closeAssessment = async (assessmentId) => {
    try {
      setLoading(true);
      await assessmentApi.close(assessmentId);
      setMessage("Assessment closed");
      loadAssessments();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to close assessment");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      DRAFT: "#C9A24B",
      ACTIVE: "#2E6B4F",
      CLOSED: "#93A1B8",
    };
    return (
      <span style={{
        background: colors[status] || "#93A1B8",
        color: "#0F1B2A",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Pre-screening assessments</h1>
            <p style={styles.subtitle}>Create assessments for shortlisted applicants and review submissions</p>
            <p style={styles.externalNote}>
              Prefer external authoring? Open a Google Doc to draft your questions and share the document link outside the portal.
            </p>
          </div>
          <div style={styles.headerActions}>
            <a
              href="https://docs.google.com/document/create"
              target="_blank"
              rel="noreferrer"
              style={styles.externalButton}
            >
              Open Google Doc
            </a>
            <button style={styles.primaryButton} onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? "Cancel" : "Create assessment"}
            </button>
          </div>
        </div>

        {message ? <div style={styles.message}>{message}</div> : null}

        {showCreateForm && (
          <form onSubmit={createAssessment} style={styles.form}>
            <label style={styles.selectLabel}>
              Vacancy
              <select
                style={styles.select}
                value={selectedVacancyId}
                onChange={(e) => setSelectedVacancyId(e.target.value)}
                required
              >
                {vacancies.map((vacancy) => (
                  <option key={vacancy.id} value={vacancy.id}>
                    {vacancy.title}
                  </option>
                ))}
              </select>
            </label>
            <input
              style={styles.input}
              placeholder="Assessment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              style={styles.textarea}
              placeholder="Instructions for applicants"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
            />
            <button style={styles.button} disabled={loading}>
              {loading ? "Creating..." : "Create assessment"}
            </button>
          </form>
        )}

        {selectedAssessment && (
          <div style={styles.questionForm}>
            <h3 style={styles.sectionTitle}>Add question to: {selectedAssessment.title}</h3>
            <form onSubmit={addQuestion} style={styles.form}>
              <input
                style={styles.input}
                placeholder="Question text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                required
              />
              <label style={styles.selectLabel}>
                Question type
                <select
                  style={styles.select}
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value)}
                >
                  <option value="YES_NO">Yes / No</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
              </label>
              <div style={styles.formActions}>
                <button style={styles.button} disabled={loading}>
                  {loading ? "Adding..." : "Add question"}
                </button>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => setSelectedAssessment(null)}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div style={styles.importSection}>
              <h3 style={styles.sectionTitle}>Import questions from external text</h3>
              <p style={styles.importNote}>
                Paste questions from Google Docs or any external source here. Use one question per line.
              </p>
              <textarea
                style={styles.externalTextarea}
                placeholder="Paste your questions here..."
                value={externalQuestionText}
                onChange={(e) => setExternalQuestionText(e.target.value)}
              />
              <div style={styles.importActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={previewExternalQuestions}
                >
                  Preview questions
                </button>
                <button
                  type="button"
                  style={styles.button}
                  onClick={importExternalQuestions}
                  disabled={importLoading || !externalQuestionText.trim()}
                >
                  {importLoading ? "Importing..." : "Import questions"}
                </button>
              </div>
              {importPreview.length > 0 && (
                <div style={styles.previewBox}>
                  <strong>{importPreview.length} questions ready to import:</strong>
                  <ul style={styles.previewList}>
                    {importPreview.map((question, index) => (
                      <li key={index} style={styles.previewItem}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={styles.assessmentsList}>
          {assessments.length === 0 ? (
            <p style={styles.emptyState}>No assessments created yet</p>
          ) : (
            assessments.map((item) => (
              <div key={item.id} style={styles.assessmentRow}>
                <div style={styles.assessmentInfo}>
                  <div style={styles.assessmentTitle}>{item.title}</div>
                  <div style={styles.assessmentMeta}>
                    {item.vacancyTitle} · {item.questionCount} questions · {item.submissionCount} submissions
                  </div>
                  <div style={styles.statusBadge}>{getStatusBadge(item.status)}</div>
                </div>
                <div style={styles.assessmentActions}>
                  {item.status === "DRAFT" && (
                    <>
                      <button
                        style={styles.actionButton}
                        onClick={() => setSelectedAssessment(item)}
                      >
                        Add questions
                      </button>
                      <button
                        style={styles.activateButton}
                        onClick={() => activateAssessment(item.id)}
                      >
                        Activate
                      </button>
                    </>
                  )}
                  {item.status === "ACTIVE" && (
                    <button
                      style={styles.closeButton}
                      onClick={() => closeAssessment(item.id)}
                    >
                      Close
                    </button>
                  )}
                  <button
                    style={styles.viewButton}
                    onClick={() => loadAssessmentQuestions(item.id)}
                  >
                    View questions
                  </button>
                  <button
                    style={styles.viewButton}
                    onClick={() => navigate(`/admin/assessments/${item.id}/responses`)}
                  >
                    View responses
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {questionViewer.assessment && (
          <div style={styles.viewerSection}>
            <h3 style={styles.sectionTitle}>Questions for: {questionViewer.assessment.title}</h3>
            {questionsLoading ? (
              <p>Loading questions…</p>
            ) : questionViewer.questions.length === 0 ? (
              <p style={styles.emptyState}>No questions found for this assessment.</p>
            ) : (
              <ol style={styles.questionList}>
                {questionViewer.questions.map((question) => (
                  <li key={question.id} style={styles.questionCard}>
                    <div style={styles.questionHeader}>
                      <span style={styles.questionNumber}>Q{question.orderIndex}</span>
                      <span style={styles.questionType}>{question.questionType}</span>
                    </div>
                    <p style={styles.questionText}>{question.questionText}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0F1B2A", color: "#EDE6D6", padding: 24, fontFamily: "Inter, sans-serif" },
  card: { maxWidth: 1000, margin: "0 auto", background: "#16253A", border: "1px solid #2B3A4F", borderRadius: 16, padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontFamily: "Source Serif 4, serif", fontSize: 28, marginBottom: 8 },
  subtitle: { color: "#93A1B8", marginBottom: 0 },
  primaryButton: { background: "#C9A24B", color: "#0F1B2A", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  externalButton: { background: "#1A73E8", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer", textDecoration: "none", marginRight: 12 },
  externalNote: { color: "#A9C5FF", marginTop: 8, maxWidth: 520 },
  headerActions: { display: "flex", alignItems: "center", gap: 8 },
  message: { background: "rgba(46,107,79,0.2)", border: "1px solid #2E6B4F", padding: 12, borderRadius: 8, marginBottom: 16, color: "#EDE6D6" },
  form: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 },
  input: { background: "#0F1B2A", color: "#EDE6D6", border: "1px solid #2B3A4F", padding: 12, borderRadius: 8, fontSize: 14 },
  selectLabel: { display: "flex", flexDirection: "column", gap: 6, color: "#93A1B8", fontWeight: 600, fontSize: 13 },
  select: { background: "#0F1B2A", color: "#EDE6D6", border: "1px solid #2B3A4F", borderRadius: 8, padding: "10px 12px", fontSize: 14 },
  textarea: { background: "#0F1B2A", color: "#EDE6D6", border: "1px solid #2B3A4F", padding: 12, borderRadius: 8, minHeight: 100, fontSize: 14, resize: "vertical" },
  button: { background: "#C9A24B", color: "#0F1B2A", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer", width: "fit-content" },
  secondaryButton: { background: "#2B3A4F", color: "#EDE6D6", border: "none", padding: "10px 16px", borderRadius: 8, cursor: "pointer" },
  questionForm: { background: "#0F1B2A", border: "1px solid #2B3A4F", borderRadius: 12, padding: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, marginBottom: 16, fontFamily: "Source Serif 4, serif" },
  formActions: { display: "flex", gap: 12, alignItems: "center" },
  importSection: { background: "#0B1725", border: "1px solid #2B3A4F", borderRadius: 12, padding: 20, marginTop: 24 },
  importNote: { color: "#A9C5FF", marginBottom: 12, maxWidth: 640 },
  externalTextarea: { width: "100%", minHeight: 160, borderRadius: 10, border: "1px solid #2B3A4F", background: "#0F1B2A", color: "#EDE6D6", padding: 14, fontSize: 14, resize: "vertical" },
  importActions: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14 },
  previewBox: { marginTop: 18, padding: 16, background: "rgba(255,255,255,0.04)", borderRadius: 12 },
  previewList: { marginTop: 10, paddingLeft: 20, color: "#EDE6D6" },
  previewItem: { marginBottom: 8 },
  viewerSection: { marginTop: 30, padding: 24, background: "#0B1725", border: "1px solid #2B3A4F", borderRadius: 16 },
  questionList: { listStylePosition: "inside", gap: 14, display: "flex", flexDirection: "column" },
  questionCard: { background: "#0F1B2A", border: "1px solid #2B3A4F", borderRadius: 12, padding: 18 },
  questionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  questionNumber: { color: "#C9A24B", fontWeight: 700 },
  questionType: { color: "#93A1B8", fontSize: 12, textTransform: "uppercase" },
  questionText: { fontSize: 15, lineHeight: 1.75, color: "#EDE6D6" },
  assessmentsList: { display: "flex", flexDirection: "column", gap: 12 },
  emptyState: { color: "#93A1B8", textAlign: "center", padding: 40 },
  assessmentRow: { background: "#0F1B2A", border: "1px solid #2B3A4F", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" },
  assessmentInfo: { flex: 1 },
  assessmentTitle: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  assessmentMeta: { color: "#93A1B8", fontSize: 13, marginBottom: 8 },
  statusBadge: { display: "inline-block" },
  assessmentActions: { display: "flex", gap: 8 },
  actionButton: { background: "#2B3A4F", color: "#EDE6D6", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  activateButton: { background: "#2E6B4F", color: "#EDE6D6", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  closeButton: { background: "#C9A24B", color: "#0F1B2A", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  viewButton: { background: "#2E6B4F", color: "#EDE6D6", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
};
