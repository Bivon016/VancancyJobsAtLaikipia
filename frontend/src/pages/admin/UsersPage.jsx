import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MailCheck,
  ShieldCheck,
  Sparkles,
  UserCog,
  Trash2,
  Pencil,
  UserPlus,
  Users,
  UserCheck,
  Eye,
  X,
  Mail,
  Phone,
  BadgeCheck,
  BadgeX,
  Calendar,
  Clock,
  Lock,
  Save,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select } from "../../components/ui/Input";
import { adminApi } from "../../api";
import { ROLES, ROLE_LABELS } from "../../utils/roles";

const STAFF_ROLES = Object.values(ROLES).filter((r) => r !== ROLES.APPLICANT);

const TABS = [
  { id: "create", label: "Create User", icon: UserPlus },
  { id: "manage", label: "Internal Users", icon: Users },
  { id: "applicants", label: "Applicants", icon: UserCheck },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Super Admin Console
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-secondary">
          User Management
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Create internal staff accounts, manage staff roles and access, and
          review applicant accounts separately.
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

      {activeTab === "create" && <CreateUserTab />}
      {activeTab === "manage" && <ManageUsersTab />}
      {activeTab === "applicants" && <ApplicantsTab />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1 — Create User
// ─────────────────────────────────────────────────────────────────────────────
function CreateUserTab() {
  const [form, setForm] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: ROLES.HR_OFFICER,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdUserEmail, setCreatedUserEmail] = useState("");

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setCreatedUserEmail("");
    try {
      const createdEmail = form.email;
      await adminApi.createUser(form);
      setCreatedUserEmail(createdEmail);
      setMessage(
        "User created successfully. A verification code has been sent to the user email. The user must verify the email before first login.",
      );
      setForm({
        fName: "",
        lName: "",
        email: "",
        password: "",
        phoneNumber: "",
        role: ROLES.HR_OFFICER,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
      <Card className="bg-gradient-to-br from-white via-white to-slate-50">
        <CardHeader
          title="Create System User"
          subtitle="Register staff accounts for the recruitment portal and send their first verification code automatically."
          action={
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/5 px-3 py-1 text-xs font-semibold text-secondary">
              <UserCog className="h-4 w-4" />
              Staff account setup
            </div>
          }
        />
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="First name"
              required
              value={form.fName}
              onChange={update("fName")}
            />
            <Input
              label="Last name"
              required
              value={form.lName}
              onChange={update("lName")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={update("email")}
            />
            <Input
              label="Phone"
              required
              value={form.phoneNumber}
              onChange={update("phoneNumber")}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <Input
              label="Temporary Password"
              type="password"
              required
              value={form.password}
              onChange={update("password")}
            />
            <Select label="Role" value={form.role} onChange={update("role")}>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm text-emerald-800 shadow-sm">
              <div className="flex items-start gap-3">
                <MailCheck className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
                <div className="space-y-2">
                  <p className="font-semibold">Account created successfully</p>
                  <p>{message}</p>
                  {createdUserEmail && (
                    <>
                      <p>
                        Verification email was sent to:{" "}
                        <span className="font-semibold">{createdUserEmail}</span>
                      </p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <Link
                          to="/verify-email"
                          state={{
                            email: createdUserEmail,
                            message:
                              "Enter the verification code sent to the new user email.",
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-secondary shadow-sm ring-1 ring-emerald-100 transition hover:bg-secondary hover:text-white"
                        >
                          <Sparkles className="h-4 w-4" />
                          Open verification page
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-sm text-muted">
              New staff users must verify email before first login.
            </p>
            <Button type="submit" loading={loading}>
              Create User
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-secondary via-secondary to-secondary/90 text-white">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-6 w-6 flex-none text-accent" />
            <div>
              <h3 className="font-heading text-lg font-bold">
                Account Activation Flow
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Every new staff user receives a verification code by email and
                must verify before first login.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            {[
              "Create the staff account with the correct role.",
              "The system emails a 6-digit verification code.",
              "Open the verification page and enter the code.",
              "After verification, the staff user can log in.",
            ].map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-xl bg-white/10 px-3 py-3"
              >
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent font-semibold text-secondary">
                  {index + 1}
                </span>
                <p className="leading-6 text-white/90">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Roles You Can Assign"
            subtitle="Use the most appropriate role for each internal user."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {STAFF_ROLES.map((r) => (
              <div
                key={r}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3"
              >
                <p className="font-semibold text-slate-700">{ROLE_LABELS[r]}</p>
                <p className="mt-1 text-sm text-muted">
                  {r === ROLES.SUPER_ADMIN &&
                    "Full system administration and oversight."}
                  {r === ROLES.CPSB_ADMIN &&
                    "Recruitment approvals, vacancy publishing, and final selection."}
                  {r === ROLES.DEPT_HEAD &&
                    "Department recruitment request submission."}
                  {r === ROLES.HR_OFFICER &&
                    "Application review, shortlisting, and interview operations."}
                  {r === ROLES.PANEL_MEMBER &&
                    "Interview participation and scoring."}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2 — Internal Users (staff only — excludes applicants)
// ─────────────────────────────────────────────────────────────────────────────
function ManageUsersTab() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  // Role editing (inline, in the table row)
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  // Regular delete
  const [deletingId, setDeletingId] = useState(null);

  // Detail modal
  const [viewingUser, setViewingUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  // Dept head reassign modal
  const [reassignUser, setReassignUser] = useState(null);
  const [availableHeads, setAvailableHeads] = useState([]);
  const [newHeadId, setNewHeadId] = useState("");
  const [reassigning, setReassigning] = useState(false);
  const [reassignError, setReassignError] = useState("");

  function loadUsers() {
    setLoadingUsers(true);
    adminApi
      .getUsers(STAFF_ROLES)
      .then(({ data }) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      `${u.fName} ${u.lName} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // ── Inline role update (table row) ──────────────────────────────────────
  async function handleSaveRole(userId) {
    setSavingRole(true);
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      setEditingRoleId(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Could not update role.");
    } finally {
      setSavingRole(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete(user) {
    if (user.role === ROLES.DEPT_HEAD) {
      setReassignError("");
      setNewHeadId("");
      setReassignUser(user);
      adminApi
        .getUsers([ROLES.DEPT_HEAD])
        .then(({ data }) =>
          setAvailableHeads(data.filter((u) => u.id !== user.id)),
        )
        .catch(() => setAvailableHeads([]));
      return;
    }

    if (
      !window.confirm(
        `Delete ${user.fName} ${user.lName} (${user.email})?\n\nThis will permanently remove all their data. This cannot be undone.`,
      )
    )
      return;

    setDeletingId(user.id);
    try {
      await adminApi.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert(err?.response?.data?.message || "Could not delete user.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Reassign & delete dept head ─────────────────────────────────────────
  async function handleReassignAndDelete(e) {
    e.preventDefault();
    if (!newHeadId) {
      setReassignError(
        "Please select a new department head before proceeding.",
      );
      return;
    }
    setReassigning(true);
    setReassignError("");
    try {
      await adminApi.reassignAndDeleteDeptHead(
        reassignUser.id,
        Number(newHeadId),
      );
      setUsers((prev) => prev.filter((u) => u.id !== reassignUser.id));
      setReassignUser(null);
    } catch (err) {
      setReassignError(
        err?.response?.data?.message || "Could not complete the operation.",
      );
    } finally {
      setReassigning(false);
    }
  }

  // ── View / edit user detail ─────────────────────────────────────────────
  async function handleView(user) {
    setViewingUser({ id: user.id });
    setViewLoading(true);
    setViewError("");
    try {
      const { data } = await adminApi.getUserDetail(user.id);
      setViewingUser(data);
    } catch (err) {
      setViewError(
        err?.response?.data?.message || "Could not load user details.",
      );
    } finally {
      setViewLoading(false);
    }
  }

  function closeViewModal() {
    setViewingUser(null);
    setViewError("");
  }

  // Called by the modal after a successful save, so the table row stays in sync
  function handleUserUpdated(updated) {
    setUsers((prev) =>
      prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Search + filter */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {users.length} internal user{users.length === 1 ? "" : "s"}
        </p>
        <div className="flex gap-3">
          <input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
          >
            <option value="ALL">All roles</option>
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        {loadingUsers && (
          <p className="py-12 text-center text-sm text-muted">
            Loading users…
          </p>
        )}
        {!loadingUsers && filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            {users.length === 0
              ? "No internal users in the system yet."
              : "No users match your search."}
          </p>
        )}
        {!loadingUsers && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td className="py-3 pr-4 font-medium text-secondary">
                      <button
                        onClick={() => handleView(user)}
                        className="text-left hover:underline"
                        title="View details"
                      >
                        {user.fName} {user.lName}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-muted">{user.email}</td>
                    <td className="py-3 pr-4 text-muted">{user.phoneNumber}</td>
                    <td className="py-3 pr-4">
                      {editingRoleId === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                          >
                            {STAFF_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSaveRole(user.id)}
                            disabled={savingRole}
                            className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                          >
                            {savingRole ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingRoleId(null)}
                            className="text-xs text-muted hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <RoleBadge role={user.role} />
                          <button
                            onClick={() => {
                              setEditingRoleId(user.id);
                              setNewRole(user.role);
                            }}
                            className="text-slate-400 hover:text-secondary"
                            title="Edit role"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleView(user)}
                          className="text-slate-400 hover:text-secondary"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          title={
                            user.role === ROLES.DEPT_HEAD
                              ? "Reassign department then delete"
                              : "Delete user"
                          }
                        >
                          {deletingId === user.id ? (
                            <span className="text-xs">Deleting…</span>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── User detail / edit modal ── */}
      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          loading={viewLoading}
          error={viewError}
          editable
          onClose={closeViewModal}
          onUpdated={handleUserUpdated}
        />
      )}

      {/* ── Dept head reassign modal ── */}
      {reassignUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !reassigning && setReassignUser(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 className="font-heading text-lg font-bold text-secondary">
                Reassign Department Before Deleting
              </h3>
              <button
                onClick={() => !reassigning && setReassignUser(null)}
                className="text-slate-400 hover:text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold">
                {reassignUser.fName} {reassignUser.lName} is a Department Head.
              </p>
              <p className="mt-1">
                You must assign a replacement Department Head before this
                account can be deleted.
              </p>
            </div>

            <form onSubmit={handleReassignAndDelete} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Select new Department Head
                </label>
                <select
                  value={newHeadId}
                  onChange={(e) => setNewHeadId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  required
                >
                  <option value="">Choose a replacement…</option>
                  {availableHeads.length === 0 ? (
                    <option disabled>
                      No other Department Heads available — create one first
                    </option>
                  ) : (
                    availableHeads.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fName} {u.lName} — {u.email}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {reassignError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reassignError}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setReassignUser(null)}
                  disabled={reassigning}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning || availableHeads.length === 0}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {reassigning ? "Processing…" : "Reassign & Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3 — Applicants (read-mostly: view + delete, no edit, no roles)
// ─────────────────────────────────────────────────────────────────────────────
function ApplicantsTab() {
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [viewingApplicant, setViewingApplicant] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState("");

  function loadApplicants() {
    setLoadingApplicants(true);
    adminApi
      .getUsers([ROLES.APPLICANT])
      .then(({ data }) => setApplicants(Array.isArray(data) ? data : []))
      .catch(() => setApplicants([]))
      .finally(() => setLoadingApplicants(false));
  }

  useEffect(() => {
    loadApplicants();
  }, []);

  const filtered = applicants.filter(
    (u) =>
      !search ||
      `${u.fName} ${u.lName} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  async function handleDelete(user) {
    if (
      !window.confirm(
        `Delete applicant ${user.fName} ${user.lName} (${user.email})?\n\nThis will permanently remove their account, applications, and uploaded documents. This cannot be undone.`,
      )
    )
      return;
    setDeletingId(user.id);
    try {
      await adminApi.deleteUser(user.id);
      setApplicants((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert(err?.response?.data?.message || "Could not delete applicant.");
    } finally {
      setDeletingId(null);
    }
  }

async function handleView(user) {
  setViewingApplicant({ id: user.id });
  setViewLoading(true);
  setViewError("");
  try {
    const { data } = await adminApi.getApplicantDetail(user.id);
    setViewingApplicant(data);
  } catch (err) {
    setViewError(
      err?.response?.data?.message || "Could not load applicant details.",
    );
  } finally {
    setViewLoading(false);
  }
}

  function closeViewModal() {
    setViewingApplicant(null);
    setViewError("");
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {applicants.length} applicant{applicants.length === 1 ? "" : "s"}{" "}
          registered
        </p>
        <input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </div>

      <Card>
        {loadingApplicants && (
          <p className="py-12 text-center text-sm text-muted">
            Loading applicants…
          </p>
        )}
        {!loadingApplicants && filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            {applicants.length === 0
              ? "No applicants have registered yet."
              : "No applicants match your search."}
          </p>
        )}
        {!loadingApplicants && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td className="py-3 pr-4 font-medium text-secondary">
                      <button
                        onClick={() => handleView(user)}
                        className="text-left hover:underline"
                        title="View details"
                      >
                        {user.fName} {user.lName}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-muted">{user.email}</td>
                    <td className="py-3 pr-4 text-muted">{user.phoneNumber}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleView(user)}
                          className="text-slate-400 hover:text-secondary"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          title="Delete applicant"
                        >
                          {deletingId === user.id ? (
                            <span className="text-xs">Deleting…</span>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {viewingApplicant && (
        <ApplicantDetailModal
          applicant={viewingApplicant}
          loading={viewLoading}
          error={viewError}
          onClose={() => {
            setViewingApplicant(null);
            setViewError("");
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User detail / edit modal (shared by Internal Users and Applicants tabs)
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function UserDetailModal({
  user,
  loading,
  error,
  editable = false,
  onClose,
  onUpdated,
}) {
  const hasDetail = !loading && !error && user?.fName;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ fName: "", lName: "", email: "" });
  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Sync form fields whenever a fresh user object loads in, or editing starts
  useEffect(() => {
    if (hasDetail) {
      setForm({ fName: user.fName, lName: user.lName, email: user.email });
    }
  }, [user, hasDetail]);

  function startEditing() {
    setForm({ fName: user.fName, lName: user.lName, email: user.email });
    setChangePassword(false);
    setPassword("");
    setSaveError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setChangePassword(false);
    setPassword("");
    setSaveError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        fName: form.fName,
        lName: form.lName,
        email: form.email,
      };
      if (changePassword && password.trim()) {
        payload.password = password.trim();
      }
      const { data } = await adminApi.updateUser(user.id, payload);
      onUpdated?.(data);
      setIsEditing(false);
      setChangePassword(false);
      setPassword("");
    } catch (err) {
      setSaveError(
        err?.response?.data?.message || "Could not save changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCloseModal() {
    if (saving) return;
    setIsEditing(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleCloseModal}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="font-heading text-lg font-bold text-secondary">
            {isEditing ? "Edit User" : "User Details"}
          </h3>
          <button
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <p className="py-10 text-center text-sm text-muted">
            Loading details…
          </p>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── View mode ── */}
        {hasDetail && !isEditing && (
          <div className="space-y-4">
            <div>
              <p className="font-heading text-xl font-bold text-secondary">
                {user.fName} {user.lName}
              </p>
              <div className="mt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4 text-sm">
              <DetailRow icon={Mail} label="Email" value={user.email} />
              <DetailRow icon={Phone} label="Phone" value={user.phoneNumber} />
              <DetailRow
                icon={user.emailVerified ? BadgeCheck : BadgeX}
                label="Email status"
                value={user.emailVerified ? "Verified" : "Not verified"}
                valueClassName={
                  user.emailVerified ? "text-emerald-700" : "text-amber-700"
                }
              />
              <DetailRow
                icon={Calendar}
                label="Account created"
                value={formatDate(user.createdAt)}
              />
              <DetailRow
                icon={Clock}
                label="Last updated"
                value={formatDate(user.updatedAt)}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={handleCloseModal}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              {editable && (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary/90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Edit mode ── */}
        {hasDetail && isEditing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  First name
                </label>
                <input
                  value={form.fName}
                  onChange={(e) =>
                    setForm({ ...form, fName: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Last name
                </label>
                <input
                  value={form.lName}
                  onChange={(e) =>
                    setForm({ ...form, lName: e.target.value })
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            {!changePassword ? (
              <button
                type="button"
                onClick={() => setChangePassword(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
              >
                <Lock className="h-3.5 w-3.5" />
                Change password
              </button>
            ) : (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    New password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setChangePassword(false);
                      setPassword("");
                    }}
                    className="text-xs text-muted hover:underline"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a new password"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
                <p className="mt-1 text-xs text-muted">
                  Leave this section closed to keep the current password.
                </p>
              </div>
            )}

            {saveError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveError}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary/90 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4 text-sm">
        {children}
      </div>
    </div>
  );
}

function ApplicantDetailModal({ applicant, loading, error, onClose }) {
  const hasDetail = !loading && !error && applicant?.fName;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="font-heading text-lg font-bold text-secondary">
            Applicant Details
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <p className="py-10 text-center text-sm text-muted">
            Loading details…
          </p>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {hasDetail && (
          <div className="space-y-6">
            <div>
              <p className="font-heading text-xl font-bold text-secondary">
                {applicant.fName} {applicant.lName}
              </p>
              <p className="text-sm text-muted">
                {applicant.email} · {applicant.phoneNumber || "No phone provided"}
              </p>
            </div>

            <DetailSection title="Account">
              <DetailRow icon={Mail} label="Email" value={applicant.email} />
              <DetailRow icon={Phone} label="Phone" value={applicant.phoneNumber || "—"} />
              <DetailRow
                icon={applicant.emailVerified ? BadgeCheck : BadgeX}
                label="Email status"
                value={applicant.emailVerified ? "Verified" : "Not verified"}
                valueClassName={
                  applicant.emailVerified ? "text-emerald-700" : "text-amber-700"
                }
              />
              <DetailRow
                icon={Calendar}
                label="Registered"
                value={formatDate(applicant.createdAt)}
              />
              <DetailRow
                icon={Clock}
                label="Last updated"
                value={formatDate(applicant.updatedAt)}
              />
              <DetailRow
                icon={applicant.profileCompleted ? BadgeCheck : BadgeX}
                label="Profile"
                value={applicant.profileCompleted ? "Complete" : "Incomplete"}
                valueClassName={
                  applicant.profileCompleted ? "text-emerald-700" : "text-amber-700"
                }
              />
            </DetailSection>

            <DetailSection title="Identity">
              <DetailRow
                icon={Mail}
                label="National ID"
                value={applicant.nationalId || "—"}
              />
              <DetailRow
                icon={Calendar}
                label="Date of birth"
                value={applicant.birthDate || "—"}
              />
              <DetailRow
                icon={Mail}
                label="Gender"
                value={applicant.gender || "—"}
              />
              <DetailRow
                icon={Mail}
                label="Marital status"
                value={applicant.maritalStatus || "—"}
              />
              <DetailRow
                icon={Mail}
                label="Nationality"
                value={applicant.nationality || "—"}
              />
              <DetailRow
                icon={Mail}
                label="Ethnicity"
                value={applicant.ethnicity || "—"}
              />
            </DetailSection>

            <DetailSection title="Location">
              <DetailRow
                icon={Mail}
                label="County of birth"
                value={applicant.countyOfBirth || "—"}
              />
              <DetailRow
                icon={Mail}
                label="County of residence"
                value={applicant.countyOfResidence || "—"}
              />
              <DetailRow
                icon={Mail}
                label="Sub-county"
                value={applicant.subCounty || "—"}
              />
              <DetailRow
                icon={Mail}
                label="Ward"
                value={applicant.ward || "—"}
              />
              <DetailRow
                icon={Phone}
                label="Village"
                value={applicant.village || "—"}
              />
              <DetailRow
                icon={Mail}
                label="Address"
                value={applicant.physicalAddress || "—"}
              />
            </DetailSection>

            <DetailSection title="Education & Experience">
              <DetailRow
                icon={Mail}
                label="Education level"
                value={applicant.educationalLevel || "—"}
              />
              <DetailRow
                icon={Calendar}
                label="Year completed"
                value={applicant.educationYearOfCompletion || "—"}
              />
              <DetailRow
                icon={Mail}
                label="Years of experience"
                value={applicant.yearsOfExperience ?? "—"}
              />
              <DetailRow
                icon={Mail}
                label="Current profession"
                value={applicant.currentProfession || "—"}
              />
            </DetailSection>

            <DetailSection title="Disability">
              <DetailRow
                icon={ShieldCheck}
                label="Disability status"
                value={applicant.disabilityStatus ? "Yes" : "No"}
                valueClassName={applicant.disabilityStatus ? "text-emerald-700" : "text-amber-700"}
              />
              {applicant.disabilityStatus && (
                <>
                  <DetailRow
                    icon={ShieldCheck}
                    label="Disability type"
                    value={applicant.disabilityType || "—"}
                  />
                  <DetailRow
                    icon={ShieldCheck}
                    label="Registration no."
                    value={applicant.disabilityRegistrationNumber || "—"}
                  />
                </>
              )}
            </DetailSection>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={onClose}
                className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary/90"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 flex-none text-slate-400" />
      <div className="flex flex-1 items-center justify-between gap-3">
        <span className="text-muted">{label}</span>
        <span className={`font-medium text-secondary ${valueClassName}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role badge
// ─────────────────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  SUPER_ADMIN: "bg-purple-50 text-purple-700",
  CPSB_ADMIN: "bg-blue-50 text-blue-700",
  DEPT_HEAD: "bg-amber-50 text-amber-700",
  HR_OFFICER: "bg-emerald-50 text-emerald-700",
  PANEL_MEMBER: "bg-slate-100 text-slate-600",
  APPLICANT: "bg-stone-50 text-stone-500",
};

function RoleBadge({ role }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role] || "bg-stone-50 text-stone-500"}`}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}