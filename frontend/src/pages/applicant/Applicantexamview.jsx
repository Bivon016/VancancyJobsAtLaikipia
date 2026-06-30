// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import { Clock, Send, CheckCircle2, Lock, AlertTriangle } from "lucide-react";
// import {
//   palette,
//   fontDisplay,
//   fontBody,
//   fontMono,
//   formatClock,
//   Stamp,
//   statusTone,
//   Spinner,
//   PageShell,
//   CenteredNotice,
// } from "./examShared";
// import { interviewsApi, interviewQuestionsApi, interviewAnswersApi, examSessionApi } from "../api";
// // adjust the import path above to wherever your interviewsApi / new exam APIs actually live

// export default function ApplicantExamView() {
//   const { interviewId } = useParams();

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [interview, setInterview] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({}); // questionId -> InterviewAnswerResponse-shaped object

//   const loadAll = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // NOTE: there's no GET /interviews/{id} in interviewsApi yet — getMy() returns
//       // a list. Swap this for a real single-interview fetch once that endpoint exists;
//       // for now we pull it out of getMy() as a stand-in.
//       const [interviewsRes, questionsRes] = await Promise.all([
//         interviewsApi.getMy(),
//         interviewQuestionsApi.getByInterview(interviewId),
//       ]);

//       const found = interviewsRes.data.find((iv) => String(iv.id) === String(interviewId));
//       if (!found) throw new Error("Interview not found or not assigned to you");
//       setInterview(found);
//       setQuestions(questionsRes.data);

//       // Pull in any answers already submitted (e.g. on page refresh mid-exam)
//       const answersRes = await interviewAnswersApi.getByInterview(interviewId);
//       const map = {};
//       answersRes.data.forEach((a) => {
//         map[a.questionId] = a;
//       });
//       setAnswers(map);
//     } catch (e) {
//       setError(e.response?.data?.message || e.message || "Failed to load interview");
//     } finally {
//       setLoading(false);
//     }
//   }, [interviewId]);

//   useEffect(() => {
//     loadAll();
//   }, [loadAll]);

//   if (loading) {
//     return (
//       <PageShell eyebrow="County Government of Laikipia · Interview Register" title="Loading…">
//         <div style={{ paddingTop: 60, textAlign: "center", color: palette.slate }}>
//           <Spinner /> &nbsp;Loading your interview session…
//         </div>
//       </PageShell>
//     );
//   }

//   if (error) {
//     return (
//       <PageShell eyebrow="County Government of Laikipia · Interview Register" title="Unable to load">
//         <CenteredNotice
//           icon={<AlertTriangle size={36} color={palette.red} />}
//           title="Something went wrong"
//           body={error}
//         />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell
//       eyebrow="County Government of Laikipia · Interview Register"
//       title={interview.vacancyTitle || "Interview session"}
//       subtitle={interview.department ? `${interview.department} · Ref ${interview.referenceNo ?? interview.id}` : null}
//     >
//       {interview.status === "SCHEDULED" && (
//         <ExamLanding
//           interview={interview}
//           questionCount={questions.length}
//           onStarted={(startData) => setInterview((iv) => ({ ...iv, ...startData, status: "IN_PROGRESS" }))}
//         />
//       )}

//       {interview.status === "IN_PROGRESS" && (
//         <ExamRunner
//           interview={interview}
//           setInterview={setInterview}
//           questions={questions}
//           setQuestions={setQuestions}
//           answers={answers}
//           setAnswers={setAnswers}
//         />
//       )}

//       {(interview.status === "COMPLETED" || interview.status === "EXPIRED") && (
//         <ExamSummary interview={interview} questions={questions} answers={answers} />
//       )}
//     </PageShell>
//   );
// }

// function ExamLanding({ interview, questionCount, onStarted }) {
//   const [starting, setStarting] = useState(false);
//   const [err, setErr] = useState(null);

//   const handleStart = async () => {
//     setStarting(true);
//     setErr(null);
//     try {
//       const res = await examSessionApi.start(interview.id);
//       onStarted(res.data);
//     } catch (e) {
//       setErr(e.response?.data?.message || "Could not start the exam. Please try again.");
//     } finally {
//       setStarting(false);
//     }
//   };

//   return (
//     <div style={{ paddingTop: 64, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
//       <div
//         style={{
//           width: 64,
//           height: 64,
//           margin: "0 auto 22px",
//           borderRadius: "50%",
//           border: `2px solid ${palette.gold}`,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Clock size={26} color={palette.gold} strokeWidth={1.75} />
//       </div>
//       <h2 style={{ fontFamily: fontDisplay, fontSize: 22, margin: "0 0 10px" }}>
//         Your interview session is ready
//       </h2>
//       <p style={{ color: palette.slate, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
//         This session contains <strong style={{ color: palette.parchment }}>{questionCount} questions</strong> and
//         a time limit of{" "}
//         <strong style={{ color: palette.parchment }}>{interview.durationMinutes ?? "—"} minutes</strong> once
//         started. The clock begins the moment you press start and cannot be paused. Unsubmitted
//         answers are recorded automatically when time runs out.
//       </p>
//       {err && (
//         <p style={{ color: palette.red, fontSize: 13, marginBottom: 16 }}>{err}</p>
//       )}
//       <button
//         className="focus-ring"
//         disabled={starting}
//         onClick={handleStart}
//         style={{
//           fontFamily: fontBody,
//           fontWeight: 600,
//           fontSize: 14.5,
//           color: palette.ink,
//           background: palette.gold,
//           border: "none",
//           borderRadius: 8,
//           padding: "13px 30px",
//           cursor: starting ? "default" : "pointer",
//           opacity: starting ? 0.7 : 1,
//         }}
//       >
//         {starting ? "Starting…" : "Start exam"}
//       </button>
//     </div>
//   );
// }

// function ExamRunner({ interview, setInterview, questions, setQuestions, answers, setAnswers }) {
//   const deadline = new Date(interview.deadline ?? interview.examStartedAt).getTime() +
//     (interview.deadline ? 0 : (interview.durationMinutes || 0) * 60 * 1000);
//   const [now, setNow] = useState(Date.now());
//   const [activeIdx, setActiveIdx] = useState(0);
//   const draftsRef = useRef({});
//   const autoSubmittedRef = useRef(false);

//   useEffect(() => {
//     const t = setInterval(() => setNow(Date.now()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   const remaining = deadline - now;
//   const pct = Math.max(0, Math.min(1, remaining / ((interview.durationMinutes || 1) * 60 * 1000)));
//   const isLow = remaining < 60 * 1000 && remaining > 0;

//   const finishLocally = useCallback((finalAnswersMap) => {
//     const allAnswered = questions.every((q) => finalAnswersMap[q.id]);
//     setInterview((iv) => ({ ...iv, status: allAnswered ? "COMPLETED" : "EXPIRED" }));
//   }, [questions, setInterview]);

//   useEffect(() => {
//     if (remaining > 0 || autoSubmittedRef.current) return;
//     autoSubmittedRef.current = true;

//     const pending = questions
//       .filter((q) => !answers[q.id] && draftsRef.current[q.id]?.trim())
//       .map((q) => ({ questionId: q.id, answerText: draftsRef.current[q.id].trim() }));

//     if (pending.length === 0) {
//       finishLocally(answers);
//       return;
//     }

//     examSessionApi
//       .autoSubmitRemaining(interview.id, pending)
//       .then((res) => {
//         const map = { ...answers };
//         res.data.forEach((a) => {
//           map[a.questionId] = a;
//         });
//         setAnswers(map);
//         finishLocally(map);
//       })
//       .catch(() => {
//         // Server-side sweep job is the backstop here — surface a generic notice
//         // and let the page reflect EXPIRED on next load/refresh.
//         finishLocally(answers);
//       });
//   }, [remaining, questions, answers, setAnswers, finishLocally, interview.id]);

//   const active = questions[activeIdx];
//   const allDone = questions.length > 0 && questions.every((q) => answers[q.id]);

//   return (
//     <div style={{ paddingTop: 28 }}>
//       <TimerBar remaining={remaining} pct={pct} isLow={isLow} />

//       <div style={{ display: "flex", gap: 22, marginTop: 22, alignItems: "flex-start", flexWrap: "wrap" }}>
//         <div style={{ width: 220, flexShrink: 0, border: `1px solid ${palette.hairline}`, borderRadius: 10, overflow: "hidden" }}>
//           {questions.map((q, i) => {
//             const done = !!answers[q.id];
//             return (
//               <button
//                 key={q.id}
//                 className="focus-ring"
//                 onClick={() => setActiveIdx(i)}
//                 style={{
//                   width: "100%",
//                   textAlign: "left",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 10,
//                   padding: "12px 14px",
//                   background: i === activeIdx ? palette.raised : "transparent",
//                   borderBottom: i < questions.length - 1 ? `1px solid ${palette.hairline}` : "none",
//                   border: "none",
//                   borderLeft: i === activeIdx ? `3px solid ${palette.gold}` : "3px solid transparent",
//                   cursor: "pointer",
//                   color: palette.parchment,
//                 }}
//               >
//                 <span style={{ fontFamily: fontMono, fontSize: 12, color: palette.slate, width: 18 }}>
//                   {String(i + 1).padStart(2, "0")}
//                 </span>
//                 <span style={{ fontSize: 12.5, flex: 1, lineHeight: 1.3 }}>Question {i + 1}</span>
//                 {done ? <CheckCircle2 size={15} color={palette.green} /> : <span style={{ width: 15 }} />}
//               </button>
//             );
//           })}
//         </div>

//         <div style={{ flex: 1, minWidth: 320 }}>
//           {active && (
//             <QuestionPanel
//               key={active.id}
//               question={active}
//               index={activeIdx}
//               total={questions.length}
//               answer={answers[active.id]}
//               draftRef={draftsRef}
//               onSubmit={async (text) => {
//                 setAnswers((prev) => ({ ...prev, [active.id]: { answerText: text, scoreStatus: "PENDING" } }));
//                 try {
//                   const res = await interviewAnswersApi.submit({ questionId: active.id, answerText: text });
//                   setAnswers((prev) => ({ ...prev, [active.id]: res.data }));
//                   setQuestions((qs) => qs.map((q) => (q.id === active.id ? { ...q, status: "ANSWERED" } : q)));
//                 } catch (e) {
//                   setAnswers((prev) => ({
//                     ...prev,
//                     [active.id]: {
//                       answerText: text,
//                       scoreStatus: "FAILED",
//                       feedback: e.response?.data?.message || "Submission failed — please try again.",
//                     },
//                   }));
//                 }
//               }}
//             />
//           )}

//           {allDone && (
//             <div
//               style={{
//                 marginTop: 18,
//                 border: `1px solid ${palette.green}55`,
//                 background: "rgba(46,107,79,0.1)",
//                 borderRadius: 10,
//                 padding: "14px 16px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 10,
//                 fontSize: 13.5,
//               }}
//             >
//               <CheckCircle2 size={17} color={palette.green} />
//               All questions answered. Your responses are saved.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function TimerBar({ remaining, pct, isLow }) {
//   const r = 21;
//   const c = 2 * Math.PI * r;
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 14,
//         border: `1px solid ${isLow ? palette.red + "66" : palette.hairline}`,
//         background: palette.panel,
//         borderRadius: 10,
//         padding: "12px 18px",
//       }}
//     >
//       <svg width="50" height="50" viewBox="0 0 50 50" style={{ flexShrink: 0 }}>
//         <circle cx="25" cy="25" r={r} fill="none" stroke={palette.hairline} strokeWidth="4" />
//         <circle
//           cx="25"
//           cy="25"
//           r={r}
//           fill="none"
//           stroke={isLow ? palette.red : palette.gold}
//           strokeWidth="4"
//           strokeLinecap="round"
//           strokeDasharray={c}
//           strokeDashoffset={c * (1 - pct)}
//           transform="rotate(-90 25 25)"
//           style={{ transition: "stroke-dashoffset 1s linear" }}
//         />
//       </svg>
//       <div>
//         <div style={{ fontFamily: fontMono, fontSize: 22, fontWeight: 600, color: isLow ? palette.red : palette.parchment, lineHeight: 1 }}>
//           {formatClock(remaining)}
//         </div>
//         <div style={{ fontSize: 11.5, color: palette.slate, marginTop: 3 }}>
//           {isLow ? "Time is almost up — unsaved drafts will auto-submit" : "Time remaining in this session"}
//         </div>
//       </div>
//     </div>
//   );
// }

// function QuestionPanel({ question, index, total, answer, draftRef, onSubmit }) {
//   const [text, setText] = useState(answer?.answerText || "");

//   useEffect(() => {
//     draftRef.current[question.id] = text;
//   }, [text, question.id, draftRef]);

//   const locked = !!answer;
//   const scoring = answer?.scoreStatus === "PENDING";

//   return (
//     <div style={{ border: `1px solid ${palette.hairline}`, background: palette.panel, borderRadius: 10, padding: "20px 22px" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
//         <span style={{ fontFamily: fontMono, fontSize: 11, color: palette.gold, letterSpacing: "0.08em" }}>
//           QUESTION {String(index + 1).padStart(2, "0")} OF {String(total).padStart(2, "0")}
//         </span>
//         {locked && !scoring && <Stamp tone={statusTone(answer.scoreStatus)}>{answer.scoreStatus}</Stamp>}
//       </div>

//       <p style={{ fontFamily: fontDisplay, fontSize: 17.5, lineHeight: 1.5, margin: "10px 0 18px" }}>
//         {question.questionText}
//       </p>

//       {!locked ? (
//         <>
//           <textarea
//             className="focus-ring"
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             placeholder="Type your answer here…"
//             rows={7}
//             style={{
//               width: "100%",
//               resize: "vertical",
//               background: palette.raised,
//               border: `1px solid ${palette.hairline}`,
//               borderRadius: 8,
//               color: palette.parchment,
//               fontFamily: fontBody,
//               fontSize: 14,
//               lineHeight: 1.55,
//               padding: "12px 14px",
//             }}
//           />
//           <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
//             <button
//               className="focus-ring"
//               disabled={!text.trim()}
//               onClick={() => onSubmit(text.trim())}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 8,
//                 fontFamily: fontBody,
//                 fontWeight: 600,
//                 fontSize: 13.5,
//                 color: text.trim() ? palette.ink : palette.slate,
//                 background: text.trim() ? palette.gold : palette.raised,
//                 border: "none",
//                 borderRadius: 7,
//                 padding: "10px 18px",
//                 cursor: text.trim() ? "pointer" : "not-allowed",
//               }}
//             >
//               <Send size={14} /> Submit answer
//             </button>
//           </div>
//         </>
//       ) : (
//         <AnswerResult answer={answer} scoring={scoring} />
//       )}
//     </div>
//   );
// }

// function AnswerResult({ answer, scoring }) {
//   return (
//     <div>
//       <div
//         style={{
//           background: palette.raised,
//           border: `1px solid ${palette.hairline}`,
//           borderRadius: 8,
//           padding: "12px 14px",
//           fontSize: 13.5,
//           lineHeight: 1.6,
//           color: palette.parchment,
//           marginBottom: 12,
//         }}
//       >
//         {answer.answerText}
//       </div>

//       {scoring ? (
//         <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: palette.gold }}>
//           <Spinner /> Grading your response…
//         </div>
//       ) : answer.scoreStatus === "FAILED" ? (
//         <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: palette.red }}>
//           <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
//           <span>{answer.feedback}</span>
//         </div>
//       ) : (
//         <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
//           <div style={{ fontFamily: fontMono, fontSize: 24, fontWeight: 600, color: palette.green, lineHeight: 1, flexShrink: 0 }}>
//             {answer.score}
//             <span style={{ fontSize: 12, color: palette.slate }}>/100</span>
//           </div>
//           <p style={{ fontSize: 13, color: palette.slate, lineHeight: 1.55, margin: 0 }}>{answer.feedback}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// function ExamSummary({ interview, questions, answers }) {
//   const completed = interview.status === "COMPLETED";
//   return (
//     <div style={{ paddingTop: 40, maxWidth: 620, margin: "0 auto" }}>
//       <div style={{ textAlign: "center", marginBottom: 30 }}>
//         {completed ? (
//           <CheckCircle2 size={40} color={palette.green} style={{ marginBottom: 12 }} />
//         ) : (
//           <Lock size={40} color={palette.red} style={{ marginBottom: 12 }} />
//         )}
//         <h2 style={{ fontFamily: fontDisplay, fontSize: 22, margin: "0 0 8px" }}>
//           {completed ? "Session complete" : "Time expired"}
//         </h2>
//         <p style={{ color: palette.slate, fontSize: 13.5 }}>
//           {completed
//             ? "All responses were recorded and graded."
//             : "The session closed automatically. Unanswered questions were left blank."}
//         </p>
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//         {questions.map((q, i) => {
//           const a = answers[q.id];
//           return (
//             <div key={q.id} style={{ border: `1px solid ${palette.hairline}`, borderRadius: 10, padding: "14px 16px", background: palette.panel }}>
//               <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
//                 <span style={{ fontSize: 13, fontWeight: 600 }}>
//                   Q{i + 1}. {q.questionText}
//                 </span>
//                 {a ? (
//                   <span style={{ fontFamily: fontMono, fontSize: 13, color: palette.green, flexShrink: 0 }}>
//                     {a.score ?? "—"}/100
//                   </span>
//                 ) : (
//                   <Stamp tone="red">Unanswered</Stamp>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }