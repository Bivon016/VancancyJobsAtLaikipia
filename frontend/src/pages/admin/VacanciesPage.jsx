import { useEffect, useState } from "react";
import { PlusCircle, LayoutList, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select, Textarea } from "../../components/ui/Input";
import { jobsApi, recruitmentApi } from "../../api";
import {
  formatDate,
  getVacancyTypeLabel,
  VACANCY_TYPES,
} from "../../utils/constants";

const TABS = [
  { id: "create", label: "Publish Vacancy", icon: PlusCircle },
  { id: "manage", label: "All Vacancies", icon: LayoutList },
];

const STATUS_STYLES = {
  OPEN: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-600",
  FILLED: "bg-blue-50 text-blue-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || "bg-stone-50 text-stone-500"}`}
    >
      {status}
    </span>
  );
}

export default function VacanciesPage() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          CPSB Admin Console
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-secondary">
          Vacancy Management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Publish new job vacancies from approved recruitment requests and
          manage existing ones.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${
              activeTab === id
                ? "bg-white text-secondary shadow-sm ring-1 ring-slate-200"
                : "text-muted hover:text-secondary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "create" && <CreateVacancyTab onCreated={() => setActiveTab("manage")} />}
      {activeTab === "manage" && <ManageVacanciesTab />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — Publish Vacancy
// ─────────────────────────────────────────────────────────────────────────────
function CreateVacancyTab({ onCreated }) {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [form, setForm] = useState({
    recruitmentRequestId: "",
    title: "",
    jobDescription: "",
    requirements: "",
    salaryScale: "",
    vacancyType: "PERMANENT_AND_PENSIONABLE",
    positionsAvailable: 1,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([recruitmentApi.getAll(), jobsApi.getAll()])
      .then(([{ data: allRequests }, { data: allVacancies }]) => {
        const publishedRequestIds = new Set(
          (Array.isArray(allVacancies) ? allVacancies : [])
            .map((v) => v.recruitmentRequest?.id)
            .filter(Boolean),
        );
        setApprovedRequests(
          allRequests.filter(
            (r) => r.status === "APPROVED" && !publishedRequestIds.has(r.id),
          ),
        );
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await jobsApi.create({
        ...form,
        recruitmentRequestId: Number(form.recruitmentRequestId),
        positionsAvailable: Number(form.positionsAvailable),
      });
      setMessage("Vacancy published successfully.");
      setForm({
        recruitmentRequestId: "",
        title: "",
        jobDescription: "",
        requirements: "",
        salaryScale: "",
        vacancyType: "PERMANENT_AND_PENSIONABLE",
        positionsAvailable: 1,
      });
      // Switch to manage tab after a short delay
      setTimeout(onCreated, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create vacancy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Create Vacancy from Approved Request"
        subtitle="Select an approved recruitment request to auto-fill the vacancy details."
      />
      <form onSubmit={handleCreate} className="space-y-5">
        <Select
          label="Approved Recruitment Request"
          required
          value={form.recruitmentRequestId}
          onChange={(e) => {
            const req = approvedRequests.find(
              (r) => r.id === Number(e.target.value),
            );
            setForm({
              ...form,
              recruitmentRequestId: e.target.value,
              title: req?.jobTitle || form.title,
              jobDescription: req
                ? [req.jobDescription, req.keyDuties && `Key Duties and Responsibilities:\n${req.keyDuties}`]
                    .filter(Boolean)
                    .join("\n\n")
                : form.jobDescription,
              requirements: req
                ? [
                    req.academicQualifications &&
                      `Academic Qualifications:\n${req.academicQualifications}`,
                    req.professionalQualifications &&
                      `Professional Qualifications:\n${req.professionalQualifications}`,
                    req.experience && `Experience:\n${req.experience}`,
                    req.technicalSkills &&
                      `Technical Skills:\n${req.technicalSkills}`,
                    req.personalAttributes &&
                      `Personal Attributes:\n${req.personalAttributes}`,
                    req.competencies && `Competencies:\n${req.competencies}`,
                  ]
                    .filter(Boolean)
                    .join("\n\n")
                : form.requirements,
              positionsAvailable: req?.numberOfPositions || 1,
            });
          }}
        >
          <option value="">Select an approved request…</option>
          {approvedRequests.length === 0 && (
            <option disabled>
              No unpublished approved requests available
            </option>
          )}
          {approvedRequests.map((r) => (
            <option key={r.id} value={r.id}>
              {r.jobTitle} — {r.department?.departmentName}
            </option>
          ))}
        </Select>

        <Input
          label="Vacancy Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          label="Job Description"
          required
          rows={4}
          value={form.jobDescription}
          onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
        />
        <Textarea
          label="Requirements"
          required
          rows={4}
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Salary Scale"
            required
            value={form.salaryScale}
            onChange={(e) => setForm({ ...form, salaryScale: e.target.value })}
            placeholder="e.g. Job Group H"
          />
          <Select
            label="Vacancy Type"
            required
            value={form.vacancyType}
            onChange={(e) => setForm({ ...form, vacancyType: e.target.value })}
          >
            {VACANCY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          <Input
            label="Positions Available"
            type="number"
            min="1"
            required
            value={form.positionsAvailable}
            onChange={(e) =>
              setForm({ ...form, positionsAvailable: e.target.value })
            }
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message} Redirecting to vacancy list…
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-muted">
            The vacancy will be immediately visible to applicants once published.
          </p>
          <Button type="submit" loading={loading}>
            Publish Vacancy
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Manage Vacancies
// ─────────────────────────────────────────────────────────────────────────────
function ManageVacanciesTab() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [actionError, setActionError] = useState("");

  const load = () => {
    setLoading(true);
    jobsApi
      .getAll()
      .then(({ data }) => setVacancies(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = vacancies.filter(
    (v) => filterStatus === "ALL" || v.status === filterStatus,
  );

  const handleClose = async (id) => {
    try {
      await jobsApi.close(id);
      load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to close vacancy.");
    }
  };

  const handleOpen = async (id) => {
    try {
      await jobsApi.open(id);
      load();
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to reopen vacancy.",
      );
    }
  };

  const handleDelete = async (id, title) => {
    if (
      !window.confirm(
        `Delete "${title}"?\n\nThis will permanently remove the vacancy. This cannot be undone.`,
      )
    )
      return;
    try {
      await jobsApi.delete(id);
      load();
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to delete vacancy.",
      );
    }
  };

  return (
    <div>
      {/* Filter + count */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {vacancies.length} vacanc{vacancies.length === 1 ? "y" : "ies"} total
        </p>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
        >
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="FILLED">Filled</option>
        </select>
      </div>

      {actionError && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <Card>
        {loading && (
          <p className="py-12 text-center text-sm text-muted">
            Loading vacancies…
          </p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            {vacancies.length === 0
              ? "No vacancies published yet."
              : "No vacancies match the selected filter."}
          </p>
        )}
        {!loading && filtered.length > 0 && (
          <ul className="divide-y text-sm">
            {filtered.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-secondary">{v.title}</p>
                    <StatusBadge status={v.status} />
                  </div>
                  <p className="mt-0.5 text-muted">
                    {v.department?.departmentName} —{" "}
                    {getVacancyTypeLabel(v.vacancyType)} — Posted{" "}
                    {formatDate(v.createdAt)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {v.positionsAvailable} position
                    {v.positionsAvailable === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {v.status === "OPEN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClose(v.id)}
                    >
                      Close
                    </Button>
                  )}
                  {v.status === "CLOSED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpen(v.id)}
                    >
                      Reopen
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(v.id, v.title)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                    title="Delete vacancy"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}