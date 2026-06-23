import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select } from "../../components/ui/Input";
import PdfReportView from "../../components/pdf/PdfReportView";
import { applicationsApi, selectionsApi } from "../../api";
import { useAuth } from "../../auth/AuthContext";
import { normalizeRole, ROLES } from "../../utils/roles";
import {
  APPLICATION_STATES,
  formatDateTime,
  getApplicantName,
  getVacancyTypeLabel,
} from "../../utils/constants";

const COLUMNS = [
  { key: "no", header: "#" },
  { key: "name", header: "Selected Candidate" },
  { key: "email", header: "Email" },
  { key: "nationalId", header: "National ID" },
  { key: "position", header: "Position" },
  { key: "vacancyType", header: "Vacancy Type" },
  { key: "department", header: "Department" },
  { key: "approvalDate", header: "Selection Date" },
  { key: "appointment", header: "Appointment Status" },
  { key: "remarks", header: "Remarks" },
];

const getApplicantReference = (application) => {
  if (!application) return "—";
  const name = getApplicantName(application);
  const nationalId = application.applicant?.nationalId
    ? `ID ${application.applicant.nationalId}`
    : null;
  const email = application.applicant?.user?.email || null;

  return [name, nationalId, email].filter(Boolean).join(" • ");
};

export default function SelectionsPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const canManageSelections = role === ROLES.CPSB_ADMIN;

  const [applications, setApplications] = useState([]);
  const [vacancyId, setVacancyId] = useState("");
  const [form, setForm] = useState({ applicationId: "", remarks: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await applicationsApi.getAll();
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setApplications([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  const vacancies = useMemo(() => {
    const grouped = new Map();

    applications.forEach((application) => {
      const vacancy = application.vacancy;
      if (!vacancy?.id || grouped.has(vacancy.id)) {
        return;
      }

      grouped.set(vacancy.id, {
        id: vacancy.id,
        title: vacancy.title || "Untitled vacancy",
        department: vacancy.department?.departmentName || "Unknown department",
      });
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [applications]);

  const effectiveVacancyId = vacancies.some(
    (vacancy) => String(vacancy.id) === String(vacancyId),
  )
    ? String(vacancyId)
    : vacancies[0]
      ? String(vacancies[0].id)
      : "";

  const selectedVacancy = useMemo(
    () =>
      vacancies.find(
        (vacancy) => String(vacancy.id) === String(effectiveVacancyId),
      ) || null,
    [effectiveVacancyId, vacancies],
  );

  const eligibleApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          application.applicationStatus === APPLICATION_STATES.INTERVIEW &&
          String(application.vacancy?.id) === String(effectiveVacancyId),
      ),
    [applications, effectiveVacancyId],
  );

  const effectiveApplicationId = eligibleApplications.some(
    (application) => String(application.id) === String(form.applicationId),
  )
    ? String(form.applicationId)
    : eligibleApplications[0]
      ? String(eligibleApplications[0].id)
      : "";

  const selectedApplication = useMemo(
    () =>
      eligibleApplications.find(
        (application) =>
          String(application.id) === String(effectiveApplicationId),
      ) || null,
    [effectiveApplicationId, eligibleApplications],
  );

  const handleSelect = async (e) => {
    e.preventDefault();
    if (!selectedApplication) {
      setMessage("Select a candidate to record the final selection.");
      return;
    }

    setLoading(true);
    try {
      await selectionsApi.create({
        applicationId: Number(selectedApplication.id),
        remarks: form.remarks,
      });
      setMessage(
        `Candidate selected: ${getApplicantReference(selectedApplication)}`,
      );
      setForm({ applicationId: "", remarks: "" });
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-secondary">
        Final Selection
      </h1>
      <p className="mt-1 text-muted">
        Record final selections and view official PDF selection reports
      </p>

      {canManageSelections && (
        <Card className="mt-6">
          <CardHeader
            title="Select Candidate"
            subtitle="Choose the vacancy first, then confirm the candidate by name and identifier."
          />
          <form onSubmit={handleSelect} className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Vacancy"
              value={effectiveVacancyId}
              onChange={(e) => {
                setVacancyId(e.target.value);
                setForm({ ...form, applicationId: "" });
              }}
              disabled={!vacancies.length}
            >
              {!vacancies.length ? (
                <option value="">No vacancies available</option>
              ) : (
                vacancies.map((vacancy) => (
                  <option key={vacancy.id} value={vacancy.id}>
                    {vacancy.title} — {vacancy.department}
                  </option>
                ))
              )}
            </Select>

            <Select
              label="Candidate"
              value={effectiveApplicationId}
              onChange={(e) =>
                setForm({ ...form, applicationId: e.target.value })
              }
              disabled={!eligibleApplications.length}
            >
              {!eligibleApplications.length ? (
                <option value="">
                  No interviewed candidates for this vacancy
                </option>
              ) : (
                eligibleApplications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {getApplicantReference(application)}
                  </option>
                ))
              )}
            </Select>

            {selectedApplication && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:col-span-2">
                Confirming candidate:{" "}
                <span className="font-semibold">
                  {getApplicantReference(selectedApplication)}
                </span>
                <div className="mt-1 text-xs text-slate-500">
                  Vacancy: {selectedApplication.vacancy?.title || "—"}
                </div>
              </div>
            )}

            <Input
              label="Remarks"
              className="sm:col-span-2"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
            {message && (
              <p className="text-sm text-muted sm:col-span-2">{message}</p>
            )}
            <Button
              type="submit"
              loading={loading}
              disabled={!selectedApplication}
            >
              Record Selection
            </Button>
          </form>
        </Card>
      )}

      <div className="mt-6">
        <Select
          label="View Selection PDF for"
          value={effectiveVacancyId}
          onChange={(e) => setVacancyId(e.target.value)}
          className="mb-4 max-w-md"
        >
          {vacancies.map((vacancy) => (
            <option key={vacancy.id} value={vacancy.id}>
              {vacancy.title} — {vacancy.department}
            </option>
          ))}
        </Select>

        <PdfReportView
          key={effectiveVacancyId}
          title={`Final Selection — ${selectedVacancy?.title || ""}`}
          subtitle="Laikipia County Public Service Board — Selection & Appointment Register"
          columns={COLUMNS}
          filename={`selections_vacancy_${effectiveVacancyId}.pdf`}
          fetchData={async () => {
            const { data } =
              await selectionsApi.getByVacancy(effectiveVacancyId);
            return data;
          }}
          buildRows={(items) =>
            items.map((s, i) => ({
              no: i + 1,
              name: s.applicantName || "—",
              email: s.applicantEmail || "—",
              nationalId: s.applicantNationalId || "—",
              position: s.vacancyTitle || "—",
              vacancyType: getVacancyTypeLabel(s.vacancyType),
              department: s.departmentName || "—",
              approvalDate: formatDateTime(s.approvalDate),
              appointment: s.appointmentStatus || "—",
              remarks: s.remarks || "—",
            }))
          }
        />
      </div>
    </div>
  );
}
