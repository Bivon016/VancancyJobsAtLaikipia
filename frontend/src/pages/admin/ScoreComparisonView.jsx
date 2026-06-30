import { useEffect, useMemo, useState } from "react";
import Card, { CardHeader } from "../../components/ui/Card";
import { Select } from "../../components/ui/Input";
import { scoresApi } from "../../api";

const RANK_BADGE_STYLES = [
  "bg-amber-100 text-amber-800 border-amber-200", // 1st
  "bg-slate-200 text-slate-700 border-slate-300", // 2nd
  "bg-orange-100 text-orange-800 border-orange-200", // 3rd
];

function formatScore(value) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(1);
}

export default function ScoreComparisonView({ vacancyGroups }) {
  const [selectedVacancyId, setSelectedVacancyId] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveVacancyId = vacancyGroups.some(
    (group) => String(group.vacancyId) === String(selectedVacancyId),
  )
    ? String(selectedVacancyId)
    : vacancyGroups[0]
      ? String(vacancyGroups[0].vacancyId)
      : "";

  useEffect(() => {
    if (!effectiveVacancyId) {
      setSummaries([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    scoresApi
      .getByVacancy(effectiveVacancyId)
      .then(({ data }) => {
        if (!cancelled) {
          setSummaries(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to load scores for this vacancy.",
          );
          setSummaries([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveVacancyId]);

  const selectedGroupLabel = useMemo(() => {
    const group = vacancyGroups.find(
      (g) => String(g.vacancyId) === String(effectiveVacancyId),
    );
    return group ? `${group.title} — ${group.department}` : "";
  }, [vacancyGroups, effectiveVacancyId]);

  return (
    <Card className="mt-6">
      <CardHeader
        title="Interview Score Comparison"
        subtitle="Candidates ranked by average panel score for the selected job category."
      />

      <Select
        label="Job Category / Vacancy"
        value={effectiveVacancyId}
        onChange={(e) => setSelectedVacancyId(e.target.value)}
        disabled={!vacancyGroups.length}
      >
        {!vacancyGroups.length ? (
          <option value="">No vacancies available</option>
        ) : (
          vacancyGroups.map((group) => (
            <option key={group.vacancyId} value={group.vacancyId}>
              {group.title} — {group.department}
            </option>
          ))
        )}
      </Select>

      {error && (
        <div className="mt-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-muted">Loading scores…</p>
      ) : !summaries.length ? (
        <p className="mt-4 text-sm text-muted">
          {effectiveVacancyId
            ? `No scored interviews yet for ${selectedGroupLabel}.`
            : "Select a job category to view scores."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-3">Candidate</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3 text-right">Technical</th>
                <th className="py-2 pr-3 text-right">Communication</th>
                <th className="py-2 pr-3 text-right">Experience</th>
                <th className="py-2 pr-3 text-right">Avg Total</th>
                <th className="py-2 pr-3 text-right">Panelists</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((row, index) => {
                const badgeStyle = RANK_BADGE_STYLES[index];

                return (
                  <tr
                    key={row.interviewId}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 pr-3">
                      {badgeStyle ? (
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${badgeStyle}`}
                        >
                          {index + 1}
                        </span>
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center text-xs font-medium text-muted">
                          {index + 1}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-slate-900">
                        {row.candidateName || "—"}
                      </p>
                      <p className="text-xs text-slate-500">{row.email || "—"}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {row.interviewStatus || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatScore(row.avgTechnicalScore)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatScore(row.avgCommunicationScore)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatScore(row.avgExperienceScore)}
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-slate-900">
                      {formatScore(row.avgTotalScore)}
                      <span className="ml-1 text-xs font-normal text-muted">/300</span>
                    </td>
                    <td className="py-3 pr-3 text-right text-muted">
                      {row.numberOfScores ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}