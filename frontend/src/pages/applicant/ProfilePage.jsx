import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle, BadgeCheck, FileCheck2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select } from "../../components/ui/Input";
import { profileApi } from "../../api";
import { GENDERS, isProfileComplete } from "../../utils/constants";

export default function ProfilePage() {
  const location = useLocation();
  const [form, setForm] = useState({
    nationalId: "",
    dateOfBirth: "",
    gender: "",
    county: "Laikipia",
    educationalLevel: "",
    yearsOfExperience: "",
  });
  const [existing, setExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    profileApi
      .get()
      .then(({ data }) => {
        setExisting(true);
        setForm({
          nationalId: data.nationalId || "",
          dateOfBirth: data.birthDate || "",
          gender: data.gender || "",
          county: data.county || "Laikipia",
          educationalLevel: data.educationalLevel || "",
          yearsOfExperience: data.yearsOfExperience ?? "",
        });
      })
      .catch(() => setExisting(false))
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const completionTarget = useMemo(
    () => ({
      ...form,
      birthDate: form.dateOfBirth,
      yearsOfExperience:
        form.yearsOfExperience !== "" ? Number(form.yearsOfExperience) : null,
    }),
    [form],
  );

  const incomplete =
    location.state?.incomplete || !isProfileComplete(completionTarget);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const payload = {
      nationalId: form.nationalId,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      county: form.county,
      educationalLevel: form.educationalLevel,
      yearsOfExperience: Number(form.yearsOfExperience),
    };
    try {
      if (existing) {
        await profileApi.update(payload);
      } else {
        await profileApi.create(payload);
        setExisting(true);
      }
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to save profile",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Applicant workspace
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">
          My Profile
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Keep your personal and professional details up to date before applying
          for county vacancies.
        </p>
      </div>

      {incomplete && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">Profile incomplete</p>
            <p className="mt-1 text-sm text-amber-800">
              All fields are required before you can apply for a vacancy.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card className="bg-gradient-to-br from-white via-white to-slate-50">
          <CardHeader
            title="Personal Information"
            subtitle="This information is used during application review and recruitment processing."
            action={
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <BadgeCheck className="h-4 w-4" />
                {existing ? "Profile on file" : "First-time setup"}
              </div>
            }
          />
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="National ID"
                required
                value={form.nationalId}
                onChange={update("nationalId")}
              />
              <Input
                label="Date of Birth"
                type="date"
                required
                value={form.dateOfBirth}
                onChange={update("dateOfBirth")}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="Gender"
                required
                value={form.gender}
                onChange={update("gender")}
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </Select>
              <Input
                label="County"
                required
                value={form.county}
                onChange={update("county")}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Highest Education Level"
                required
                placeholder="e.g. Bachelor's Degree"
                value={form.educationalLevel}
                onChange={update("educationalLevel")}
              />
              <Input
                label="Years of Experience"
                type="number"
                min="0"
                required
                value={form.yearsOfExperience}
                onChange={update("yearsOfExperience")}
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                {message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-sm text-muted">
                Make sure your details match your supporting documents.
              </p>
              <Button type="submit" variant="primary" loading={saving}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary via-primary to-primary-light text-white">
            <div className="flex items-start gap-3">
              <FileCheck2 className="mt-1 h-6 w-6 flex-none text-accent" />
              <div>
                <h3 className="font-heading text-lg font-bold">
                  Application readiness
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  A complete profile makes it easier to submit applications and
                  helps the recruitment team validate your details quickly.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {[
                "Provide a valid national ID and date of birth.",
                "Confirm gender and county details.",
                "Add your highest education level accurately.",
                "Enter your total years of relevant experience.",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-xl bg-white/10 px-3 py-3"
                >
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent font-semibold text-primary-dark">
                    {index + 1}
                  </span>
                  <p className="leading-6 text-white/90">{step}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Profile status"
              subtitle="Your application account should stay ready at all times."
            />
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <p className="text-sm text-muted">Current state</p>
                <p className="mt-1 font-semibold text-primary">
                  {incomplete ? "Needs completion" : "Ready for applications"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <p className="text-sm text-muted">Profile mode</p>
                <p className="mt-1 font-semibold text-primary">
                  {existing ? "Update existing details" : "Create your profile"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
