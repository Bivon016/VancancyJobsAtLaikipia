import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assessmentApi } from "../../api";

export default function AssessmentResponsesPage() {
  const { assessmentId } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedResponseId, setExpandedResponseId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await assessmentApi.getResponses(assessmentId);
        setResponses(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assessmentId]);

  const handleRecommendationChange = async (responseId, recommendation) => {
    try {
      await assessmentApi.submitRecommendation(responseId, recommendation);
      setMessage("Recommendation saved");
      setResponses((prev) =>
        prev.map((r) =>
          r.responseId === responseId ? { ...r, recommendation } : r
        )
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to save recommendation");
    }
  };

  const getRecommendationBadge = (recommendation) => {
    const colors = {
      PROCEED: "#2E6B4F",
      DO_NOT_PROCEED: "#C9A24B",
      HOLD: "#93A1B8",
    };
    return (
      <span
        style={{
          background: colors[recommendation] || "#93A1B8",
          color: "#0F1B2A",
          padding: "4px 10px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {recommendation?.replace(/_/g, " ") || "Pending"}
      </span>
    );
  };

  const summary = {
    total: responses.length,
    proceed: responses.filter((r) => r.recommendation === "PROCEED").length,
    doNotProceed: responses.filter((r) => r.recommendation === "DO_NOT_PROCEED").length,
    hold: responses.filter((r) => r.recommendation === "HOLD").length,
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p>Loading responses…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Assessment responses</h1>
        {message ? <div style={styles.message}>{message}</div> : null}

        <div style={styles.summaryBar}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total submissions:</span>
            <span style={styles.summaryValue}>{summary.total}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Proceed:</span>
            <span style={{ ...styles.summaryValue, color: "#2E6B4F" }}>
              {summary.proceed}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Do not proceed:</span>
            <span style={{ ...styles.summaryValue, color: "#C9A24B" }}>
              {summary.doNotProceed}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Hold:</span>
            <span style={{ ...styles.summaryValue, color: "#93A1B8" }}>
              {summary.hold}
            </span>
          </div>
        </div>

        <div style={styles.responsesList}>
          {responses.length === 0 ? (
            <p style={styles.emptyState}>No submissions yet</p>
          ) : (
            responses.map((response) => (
              <div key={response.responseId} style={styles.responseCard}>
                <div
                  style={styles.responseHeader}
                  onClick={() =>
                    setExpandedResponseId(
                      expandedResponseId === response.responseId
                        ? null
                        : response.responseId
                    )
                  }
                >
                  <div style={styles.applicantInfo}>
                    <div style={styles.applicantName}>
                      {response.applicantName}
                    </div>
                    <div style={styles.applicantEmail}>
                      {response.applicantEmail}
                    </div>
                    <div style={styles.submittedTime}>
                      Submitted:{" "}
                      {new Date(response.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={styles.responseMeta}>
                    {getRecommendationBadge(response.recommendation)}
                  </div>
                </div>

                {expandedResponseId === response.responseId && (
                  <div style={styles.responseDetails}>
                    <div style={styles.answersSection}>
                      <h4 style={styles.answersTitle}>Answers</h4>
                      {response.answers?.map((answer, index) => (
                        <div key={index} style={styles.answerItem}>
                          <div style={styles.answerQuestion}>
                            {answer.questionText}
                          </div>
                          <div style={styles.answerText}>
                            {answer.answerText}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={styles.recommendationSection}>
                      <label style={styles.selectLabel}>
                        Recommendation
                        <select
                          style={styles.select}
                          value={response.recommendation || ""}
                          onChange={(e) =>
                            handleRecommendationChange(
                              response.responseId,
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select recommendation</option>
                          <option value="PROCEED">Proceed</option>
                          <option value="DO_NOT_PROCEED">Do not proceed</option>
                          <option value="HOLD">Hold</option>
                        </select>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0F1B2A",
    color: "#EDE6D6",
    padding: 24,
    fontFamily: "Inter, sans-serif",
  },
  card: {
    maxWidth: 1000,
    margin: "0 auto",
    background: "#16253A",
    border: "1px solid #2B3A4F",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontFamily: "Source Serif 4, serif",
    fontSize: 28,
    marginBottom: 20,
  },
  message: {
    background: "rgba(46,107,79,0.2)",
    border: "1px solid #2E6B4F",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: "#EDE6D6",
  },
  summaryBar: {
    display: "flex",
    gap: 24,
    background: "#0F1B2A",
    border: "1px solid #2B3A4F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  summaryLabel: {
    color: "#93A1B8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 700,
  },
  responsesList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  emptyState: {
    color: "#93A1B8",
    textAlign: "center",
    padding: 40,
  },
  responseCard: {
    background: "#0F1B2A",
    border: "1px solid #2B3A4F",
    borderRadius: 12,
    overflow: "hidden",
  },
  responseHeader: {
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 4,
  },
  applicantEmail: {
    color: "#93A1B8",
    fontSize: 13,
    marginBottom: 4,
  },
  submittedTime: {
    color: "#93A1B8",
    fontSize: 12,
  },
  responseMeta: {
    display: "flex",
    alignItems: "center",
  },
  responseDetails: {
    padding: 16,
    borderTop: "1px solid #2B3A4F",
  },
  answersSection: {
    marginBottom: 20,
  },
  answersTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
    color: "#93A1B8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  answerItem: {
    background: "#16253A",
    border: "1px solid #2B3A4F",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  answerQuestion: {
    fontWeight: 600,
    marginBottom: 6,
    fontSize: 14,
  },
  answerText: {
    color: "#93A1B8",
    fontSize: 14,
  },
  recommendationSection: {
    paddingTop: 16,
    borderTop: "1px solid #2B3A4F",
  },
  selectLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    color: "#93A1B8",
    fontWeight: 600,
    fontSize: 13,
  },
  select: {
    background: "#0F1B2A",
    color: "#EDE6D6",
    border: "1px solid #2B3A4F",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
  },
};
