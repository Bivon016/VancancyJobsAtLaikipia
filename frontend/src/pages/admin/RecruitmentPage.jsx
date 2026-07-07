import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select, Textarea } from "../../components/ui/Input";
import { departmentsApi, recruitmentApi } from "../../api";
import { formatDateTime } from "../../utils/constants";
import { useAuth } from "../../auth/AuthContext";
import { normalizeRole, ROLES } from "../../utils/roles";

export default function RecruitmentPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isDeptHead = role === ROLES.DEPT_HEAD;
  const isCpsb = role === ROLES.CPSB_ADMIN;
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;

  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    departmentId: "",
    jobTitle: "",
    jobDescription: "",
    keyDuties: "",
    academicQualifications: "",
    professionalQualifications: "",
    experience: "",
    technicalSkills: "",
    personalAttributes: "",
    competencies: "",
    numberOfPositions: 1,
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    const fetcher = isCpsb
      ? recruitmentApi.getPending()
      : recruitmentApi.getAll().catch(() => recruitmentApi.getPending());
    fetcher.then(({ data }) => setRequests(data)).catch(() => {});
  };

  useEffect(() => {
    load();
    departmentsApi
      .getAll()
      .then(({ data }) => setDepartments(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recruitmentApi.submit({
        ...form,
        departmentId: Number(form.departmentId),
        numberOfPositions: Number(form.numberOfPositions),
      });
      setMessage("Request submitted.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await recruitmentApi.approve(id);
    load();
  };

  const handleReject = async (id) => {
    await recruitmentApi.reject(id);
    load();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-bold text-secondary">
        Recruitment Requests
      </h1>

      {isDeptHead && (
        <Card className="mt-6">
          <CardHeader title="Submit New Request" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Department"
              required
              value={form.departmentId}
              onChange={(e) =>
                setForm({ ...form, departmentId: e.target.value })
              }
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName}
                </option>
              ))}
            </Select>
            <Input
              label="Job Title"
              required
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            />
            <Textarea
              label="Job Description"
              required
              value={form.jobDescription}
              onChange={(e) =>
                setForm({ ...form, jobDescription: e.target.value })
              }
            />
            <Textarea
              label="Key Duties and Responsibilities"
              required
              placeholder="One duty per line"
              value={form.keyDuties}
              onChange={(e) =>
                setForm({ ...form, keyDuties: e.target.value })
              }
            />
            <Textarea
              label="Academic Qualifications"
              required
              value={form.academicQualifications}
              onChange={(e) =>
                setForm({ ...form, academicQualifications: e.target.value })
              }
            />
            <Textarea
              label="Professional Qualifications"
              value={form.professionalQualifications}
              onChange={(e) =>
                setForm({
                  ...form,
                  professionalQualifications: e.target.value,
                })
              }
            />
            <Textarea
              label="Experience"
              required
              value={form.experience}
              onChange={(e) =>
                setForm({ ...form, experience: e.target.value })
              }
            />
            <Textarea
              label="Technical Skills"
              value={form.technicalSkills}
              onChange={(e) =>
                setForm({ ...form, technicalSkills: e.target.value })
              }
            />
            <Textarea
              label="Personal Attributes"
              value={form.personalAttributes}
              onChange={(e) =>
                setForm({ ...form, personalAttributes: e.target.value })
              }
            />
            <Textarea
              label="Competencies"
              placeholder="One competency per line"
              value={form.competencies}
              onChange={(e) =>
                setForm({ ...form, competencies: e.target.value })
              }
            />
            <Input
              label="Number of Positions"
              type="number"
              min="1"
              required
              value={form.numberOfPositions}
              onChange={(e) =>
                setForm({ ...form, numberOfPositions: e.target.value })
              }
            />
            <Textarea
              label="Reason for Recruitment"
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
            {message && (
              <div className="rounded-md bg-blue-50 p-3 text-sm">{message}</div>
            )}
            <Button type="submit" loading={loading}>
              Submit Request
            </Button>
          </form>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader
          title={isCpsb ? "Pending Approvals" : "Recruitment Requests"}
        />
        <ul className="divide-y text-sm">
          {requests.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.jobTitle}</p>
                  <p className="text-muted">
                    {r.department?.departmentName} — {r.numberOfPositions}{" "}
                    position(s)
                  </p>
                  <p className="text-xs text-muted">
                    {formatDateTime(r.requestDate)} — {r.status}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setExpandedId(expandedId === r.id ? null : r.id)
                    }
                  >
                    {expandedId === r.id ? "Hide Details" : "View Details"}
                  </Button>
                  {isCpsb && !isSuperAdmin && r.status === "PENDING" && (
                    <>
                      <Button size="sm" onClick={() => handleApprove(r.id)}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(r.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {expandedId === r.id && <RequestDetails request={r} />}
            </li>
          ))}
          {requests.length === 0 && (
            <p className="py-4 text-muted">No requests found.</p>
          )}
        </ul>
      </Card>
    </div>
  );
}

const DETAIL_FIELDS = [
  { key: "jobDescription", label: "Job Description" },
  { key: "keyDuties", label: "Key Duties and Responsibilities" },
  { key: "academicQualifications", label: "Academic Qualifications" },
  { key: "professionalQualifications", label: "Professional Qualifications" },
  { key: "experience", label: "Experience" },
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "personalAttributes", label: "Personal Attributes" },
  { key: "competencies", label: "Competencies" },
  { key: "reason", label: "Reason for Recruitment" },
];

function RequestDetails({ request }) {
  return (
    <div className="mt-4 space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      {DETAIL_FIELDS.map(
        ({ key, label }) =>
          request[key] && (
            <div key={key}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {label}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-secondary">
                {request[key]}
              </p>
            </div>
          ),
      )}
    </div>
  );
}
