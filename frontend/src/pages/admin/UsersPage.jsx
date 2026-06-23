import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck, ShieldCheck, Sparkles, UserCog } from "lucide-react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select } from "../../components/ui/Input";
import { adminApi } from "../../api";
import { ROLES, ROLE_LABELS } from "../../utils/roles";

export default function UsersPage() {
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
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Super Admin Console
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-secondary">
            User Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Create internal staff accounts, assign the correct role, and guide
            new users through first-time email verification.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
          <p className="font-semibold">Selected role</p>
          <p className="mt-1">{ROLE_LABELS[form.role]}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
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
                {Object.values(ROLES)
                  .filter((r) => r !== ROLES.APPLICANT)
                  .map((r) => (
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
                    <p className="font-semibold">
                      Account created successfully
                    </p>
                    <p>{message}</p>
                    {createdUserEmail && (
                      <>
                        <p>
                          Verification email was sent to:{" "}
                          <span className="font-semibold">
                            {createdUserEmail}
                          </span>
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
              {Object.values(ROLES)
                .filter((r) => r !== ROLES.APPLICANT)
                .map((r) => {
                  const active = form.role === r;
                  return (
                    <div
                      key={r}
                      className={`rounded-2xl border px-4 py-3 transition ${active ? "border-secondary bg-secondary/5 shadow-sm" : "border-slate-200 bg-slate-50/80"}`}
                    >
                      <p
                        className={`font-semibold ${active ? "text-secondary" : "text-slate-700"}`}
                      >
                        {ROLE_LABELS[r]}
                      </p>
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
                  );
                })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
