import React, { useState, useEffect } from "react";
import {
  palette,
  PageShell,
  Stamp,
  statusTone,
  Spinner,
  CenteredNotice,
  formatClock,
} from "../../utils/designSystem.jsx";
import { interviewAnswersApi } from "../../api";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export function InterviewTranscriptView({ interview }) {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("question"); // question | score

  useEffect(() => {
    loadAnswers();
  }, [interview.id]);

  const loadAnswers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await interviewAnswersApi.getForInterview(interview.id);
      setAnswers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transcript");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedAnswers = () => {
    const sorted = [...answers];
    if (sortBy === "score") {
      sorted.sort((a, b) => {
        const scoreA = a.scoreStatus === "SCORED" ? a.score : -1;
        const scoreB = b.scoreStatus === "SCORED" ? b.score : -1;
        return scoreB - scoreA;
      });
    }
    return sorted;
  };

  const stats = {
    total: answers.length,
    scored: answers.filter((a) => a.scoreStatus === "SCORED").length,
    failed: answers.filter((a) => a.scoreStatus === "FAILED").length,
    pending: answers.filter((a) => a.scoreStatus === "PENDING").length,
    averageScore:
      answers.filter((a) => a.scoreStatus === "SCORED").length > 0
        ? Math.round(
            answers
              .filter((a) => a.scoreStatus === "SCORED")
              .reduce((sum, a) => sum + (a.score || 0), 0) /
              answers.filter((a) => a.scoreStatus === "SCORED").length
          )
        : 0,
  };

  return (
    <PageShell
      eyebrow="Panel / Admin"
      title="Interview Transcript"
      subtitle={interview.vacancyTitle}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* Stats Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 24,
            marginTop: 24,
          }}
        >
          <StatCard label="Total Answers" value={stats.total} />
          <StatCard
            label="Scored"
            value={stats.scored}
            tone={stats.scored > 0 ? "green" : "slate"}
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            tone={stats.failed > 0 ? "red" : "slate"}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            tone={stats.pending > 0 ? "gold" : "slate"}
          />
          {stats.scored > 0 && (
            <StatCard label="Average Score" value={`${stats.averageScore}%`} tone="green" />
          )}
        </div>

        {/* Sort Controls */}
        <div
          style={{
            marginBottom: 20,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: palette.slate,
            }}
          >
            Sort:
          </span>
          {["question", "score"].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              style={{
                padding: "6px 12px",
                background:
                  sortBy === option
                    ? palette.gold
                    : `rgba(147,161,184,0.1)`,
                color:
                  sortBy === option ? palette.ink : palette.slate,
                border: "none",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Transcript Section */}
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
            Q&A Transcript
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

          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spinner />
              <p style={{ color: palette.slate, marginTop: 12 }}>Loading transcript...</p>
            </div>
          ) : answers.length === 0 ? (
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
              title="No Answers Yet"
              body="The applicant has not yet submitted any answers for this interview."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {sortedAnswers().map((answer, idx) => (
                <div
                  key={answer.id}
                  style={{
                    background: palette.raised,
                    border: `1px solid ${palette.hairline}`,
                    borderRadius: 6,
                    padding: 16,
                  }}
                >
                  {/* Question */}
                  <div style={{ marginBottom: 12 }}>
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
                      <span
                        style={{
                          fontFamily: fontMono,
                          fontSize: 10.5,
                          color: palette.slate,
                        }}
                      >
                        •
                      </span>
                      <span
                        style={{
                          fontFamily: fontBody,
                          fontSize: 12,
                          color: palette.slate,
                        }}
                      >
                        Submitted {new Date(answer.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: fontBody,
                        fontSize: 13.5,
                        color: palette.parchment,
                        lineHeight: 1.6,
                        margin: 0,
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      {answer.questionText}
                    </p>
                  </div>

                  {/* Answer */}
                  <div
                    style={{
                      background: `rgba(147,161,184,0.05)`,
                      borderRadius: 4,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: palette.gold,
                        marginBottom: 6,
                      }}
                    >
                      Applicant's Answer
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
                      {answer.answerText}
                    </p>
                  </div>

                  {/* Score & Feedback */}
                  {answer.scoreStatus === "SCORED" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 12px",
                          background: `rgba(46,107,79,0.1)`,
                          borderRadius: 4,
                          minWidth: 100,
                        }}
                      >
                        <CheckCircle2 size={16} color={palette.green} />
                        <span
                          style={{
                            fontFamily: fontMono,
                            fontSize: 12,
                            fontWeight: 600,
                            color: palette.green,
                          }}
                        >
                          {answer.score}/100
                        </span>
                      </div>
                      {answer.feedback && (
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: palette.slate,
                              marginBottom: 4,
                            }}
                          >
                            LLM Feedback
                          </div>
                          <p
                            style={{
                              fontSize: 12.5,
                              color: palette.slate,
                              lineHeight: 1.5,
                              margin: 0,
                            }}
                          >
                            {answer.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : answer.scoreStatus === "FAILED" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 12px",
                        background: "rgba(179,73,31,0.12)",
                        border: `1px solid ${palette.red}55`,
                        borderRadius: 4,
                      }}
                    >
                      <XCircle size={16} color={palette.red} />
                      <div>
                        <span
                          style={{
                            display: "block",
                            fontWeight: 600,
                            fontSize: 12,
                            color: palette.red,
                            marginBottom: 2,
                          }}
                        >
                          Automated Scoring Failed
                        </span>
                        <span style={{ fontSize: 12, color: palette.slate }}>
                          {answer.feedback ||
                            "The LLM scoring engine encountered an error. Manual review required."}
                        </span>
                      </div>
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
                      <span style={{ fontSize: 12.5, color: palette.slate }}>
                        Scoring in progress...
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applicant Info */}
        {answers.length > 0 && (
          <div
            style={{
              background: palette.panel,
              border: `1px solid ${palette.hairline}`,
              borderRadius: 8,
              padding: 16,
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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
                Applicant
              </span>
              <p style={{ margin: 0, fontSize: 13.5 }}>
                {answers[0]?.applicantName || "Unknown"}
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
                Interview ID
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  fontFamily: fontMono,
                }}
              >
                {interview.id}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function StatCard({ label, value, tone = "slate" }) {
  const tones = {
    green: palette.green,
    gold: palette.gold,
    red: palette.red,
    slate: palette.slate,
  };

  return (
    <div
      style={{
        background: palette.raised,
        border: `1px solid ${palette.hairline}`,
        borderRadius: 6,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: palette.slate,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontFamily: fontMono,
          fontWeight: 600,
          color: tones[tone],
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default InterviewTranscriptView;
