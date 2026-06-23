import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertTriangle,
  BadgeCheck,
  FileCheck2,
  HeartHandshake,
  MapPinned,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select } from "../../components/ui/Input";
import { profileApi } from "../../api";
import { GENDERS, isProfileComplete } from "../../utils/constants";

const MARITAL_STATUSES = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "WIDOWED", label: "Widowed" },
  { value: "DIVORCED", label: "Divorced" },
];

const COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
];

const INITIAL_FORM = {
  nationalId: "",
  birthDate: "",
  gender: "",
  maritalStatus: "",
  nationality: "Kenyan",
  postalAddress: "",
  physicalAddress: "",
  countyOfBirth: "Laikipia",
  countyOfResidence: "Laikipia",
  subCounty: "",
  ward: "",
  village: "",
  disabilityStatus: "",
  disabilityType: "",
  disabilityRegistrationNumber: "",
  ethnicity: "",
  educationalLevel: "",
  educationYearOfCompletion: "",
  yearsOfExperience: "",
  currentProfession: "",
};

export default function ProfilePage() {
  const location = useLocation();
  const [form, setForm] = useState(INITIAL_FORM);
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
          birthDate: data.birthDate || "",
          gender: data.gender || "",
          maritalStatus: data.maritalStatus || "",
          nationality: data.nationality || "Kenyan",
          postalAddress: data.postalAddress || "",
          physicalAddress: data.physicalAddress || "",
          countyOfBirth: data.countyOfBirth || "Laikipia",
          countyOfResidence: data.countyOfResidence || "Laikipia",
          subCounty: data.subCounty || "",
          ward: data.ward || "",
          village: data.village || "",
          disabilityStatus:
            data.disabilityStatus == null ? "" : String(data.disabilityStatus),
          disabilityType: data.disabilityType || "",
          disabilityRegistrationNumber: data.disabilityRegistrationNumber || "",
          ethnicity: data.ethnicity || "",
          educationalLevel: data.educationalLevel || "",
          educationYearOfCompletion: data.educationYearOfCompletion ?? "",
          yearsOfExperience: data.yearsOfExperience ?? "",
          currentProfession: data.currentProfession || "",
        });
      })
      .catch(() => setExisting(false))
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) =>
    setForm((current) => ({ ...current, [field]: e.target.value }));

  const updateNationalId = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((current) => ({ ...current, nationalId: value }));
  };

  const updateDisabilityStatus = (e) => {
    const value = e.target.value;
    setForm((current) => ({
      ...current,
      disabilityStatus: value,
      ...(value === "true"
        ? {}
        : {
            disabilityType: "",
            disabilityRegistrationNumber: "",
          }),
    }));
  };

  const completionTarget = useMemo(
    () => ({
      ...form,
      disabilityStatus:
        form.disabilityStatus === "" ? null : form.disabilityStatus === "true",
      educationYearOfCompletion:
        form.educationYearOfCompletion !== ""
          ? Number(form.educationYearOfCompletion)
          : null,
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

    const hasDisability = form.disabilityStatus === "true";
    if (hasDisability && !form.disabilityType.trim()) {
      setError("Disability type is required when disability status is yes.");
      setSaving(false);
      return;
    }

    const payload = {
      nationalId: form.nationalId.trim(),
      birthDate: form.birthDate,
      gender: form.gender || null,
      maritalStatus: form.maritalStatus || null,
      nationality: form.nationality.trim(),
      postalAddress: form.postalAddress.trim(),
      physicalAddress: form.physicalAddress.trim(),
      countyOfBirth: form.countyOfBirth.trim(),
      countyOfResidence: form.countyOfResidence.trim(),
      subCounty: form.subCounty.trim(),
      ward: form.ward.trim(),
      village: form.village.trim(),
      disabilityStatus:
        form.disabilityStatus === "" ? null : form.disabilityStatus === "true",
      disabilityType: hasDisability ? form.disabilityType.trim() : null,
      disabilityRegistrationNumber: hasDisability
        ? form.disabilityRegistrationNumber.trim()
        : null,
      ethnicity: form.ethnicity.trim(),
      educationalLevel: form.educationalLevel.trim(),
      educationYearOfCompletion:
        form.educationYearOfCompletion === ""
          ? null
          : Number(form.educationYearOfCompletion),
      yearsOfExperience:
        form.yearsOfExperience === "" ? null : Number(form.yearsOfExperience),
      currentProfession: form.currentProfession.trim(),
    };

    try {
      const { data } = existing
        ? await profileApi.update(payload)
        : await profileApi.create(payload);

      setExisting(true);
      setForm((current) => ({
        ...current,
        birthDate: data.birthDate || current.birthDate,
        disabilityStatus:
          data.disabilityStatus == null
            ? current.disabilityStatus
            : String(data.disabilityStatus),
        educationYearOfCompletion:
          data.educationYearOfCompletion ?? current.educationYearOfCompletion,
      }));
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
          Keep your personal, location, and professional details up to date so
          your applications can move through county recruitment smoothly.
        </p>
      </div>

      {incomplete && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">Profile incomplete</p>
            <p className="mt-1 text-sm text-amber-800">
              Complete the required personal, contact, disability, and education
              fields before applying for a vacancy.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-white to-slate-50">
            <CardHeader
              title="Personal Information"
              subtitle="Core identity details used during applicant verification and review."
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
                  inputMode="numeric"
                  maxLength={10}
                  minLength={6}
                  pattern="[0-9]{6,10}"
                  title="National ID must be 6 to 10 digits"
                  value={form.nationalId}
                  onChange={updateNationalId}
                />
                <Input
                  label="Birth Date"
                  type="date"
                  required
                  value={form.birthDate}
                  onChange={update("birthDate")}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <Select
                  label="Marital Status"
                  value={form.maritalStatus}
                  onChange={update("maritalStatus")}
                >
                  <option value="">Select marital status</option>
                  {MARITAL_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Nationality"
                  required
                  value={form.nationality}
                  onChange={update("nationality")}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Postal Address"
                  value={form.postalAddress}
                  onChange={update("postalAddress")}
                  placeholder="P.O. Box 123 - 20300"
                />
                <Input
                  label="Physical Address"
                  required
                  value={form.physicalAddress}
                  onChange={update("physicalAddress")}
                  placeholder="Town, estate, or landmark"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                  label="County of Birth"
                  required
                  value={form.countyOfBirth}
                  onChange={update("countyOfBirth")}
                >
                  <option value="">Select county of birth</option>
                  {COUNTIES.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </Select>
                <Select
                  label="County of Residence"
                  required
                  value={form.countyOfResidence}
                  onChange={update("countyOfResidence")}
                >
                  <option value="">Select county of residence</option>
                  {COUNTIES.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  label="Sub County"
                  value={form.subCounty}
                  onChange={update("subCounty")}
                />
                <Input
                  label="Ward"
                  value={form.ward}
                  onChange={update("ward")}
                />
                <Input
                  label="Village"
                  value={form.village}
                  onChange={update("village")}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                  label="Living with Disability"
                  value={form.disabilityStatus}
                  onChange={updateDisabilityStatus}
                >
                  <option value="">Select option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
                <Input
                  label="Ethnicity"
                  value={form.ethnicity}
                  onChange={update("ethnicity")}
                />
              </div>

              {form.disabilityStatus === "true" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Disability Type"
                    required
                    value={form.disabilityType}
                    onChange={update("disabilityType")}
                    placeholder="Specify the disability type"
                  />
                  <Input
                    label="Disability Registration Number"
                    value={form.disabilityRegistrationNumber}
                    onChange={update("disabilityRegistrationNumber")}
                  />
                </div>
              )}

              <div className="border-t border-slate-100 pt-2">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
                  <HeartHandshake className="h-4 w-4" />
                  Professional Details
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Input
                    label="Education Type / Qualification"
                    required
                    placeholder="e.g. KCSE, Diploma, Bachelor's Degree"
                    value={form.educationalLevel}
                    onChange={update("educationalLevel")}
                  />
                  <Input
                    label="Year of Completion"
                    type="number"
                    min="1950"
                    max="2100"
                    required
                    value={form.educationYearOfCompletion}
                    onChange={update("educationYearOfCompletion")}
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={form.yearsOfExperience}
                    onChange={update("yearsOfExperience")}
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Current Profession"
                    value={form.currentProfession}
                    onChange={update("currentProfession")}
                    placeholder="e.g. Accountant, Nurse, Administrator"
                  />
                </div>
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
                  Make sure these details match your supporting documents and
                  official records.
                </p>
                <Button type="submit" variant="primary" loading={saving}>
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary via-primary to-primary-light text-white">
            <div className="flex items-start gap-3">
              <FileCheck2 className="mt-1 h-6 w-6 flex-none text-accent" />
              <div>
                <h3 className="font-heading text-lg font-bold">
                  Application readiness
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  A complete profile gives the recruitment team the information
                  they need to validate your eligibility faster.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {[
                "Provide valid identity and contact details.",
                "Confirm where you were born and currently reside.",
                "Specify disability type if disability status is yes.",
                "Include education type and year of completion accurately.",
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
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div className="flex items-start gap-3">
                  <MapPinned className="mt-0.5 h-4 w-4 text-secondary" />
                  <div>
                    <p className="text-sm text-muted">Residence summary</p>
                    <p className="mt-1 font-semibold text-primary">
                      {form.countyOfResidence || "County not set"}
                    </p>
                    {(form.subCounty || form.ward) && (
                      <p className="mt-1 text-sm text-muted">
                        {[form.subCounty, form.ward]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
