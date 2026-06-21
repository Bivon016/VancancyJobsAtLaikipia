import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input, { Select } from '../../components/ui/Input';
import { profileApi } from '../../api';
import { GENDERS, isProfileComplete } from '../../utils/constants';

export default function ProfilePage() {
  const location = useLocation();
  const [form, setForm] = useState({
    nationalId: '',
    dateOfBirth: '',
    gender: '',
    county: 'Laikipia',
    educationalLevel: '',
    yearsOfExperience: '',
  });
  const [existing, setExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    profileApi
      .get()
      .then(({ data }) => {
        setExisting(true);
        setForm({
          nationalId: data.nationalId || '',
          dateOfBirth: data.birthDate || '',
          gender: data.gender || '',
          county: data.county || 'Laikipia',
          educationalLevel: data.educationalLevel || '',
          yearsOfExperience: data.yearsOfExperience ?? '',
        });
      })
      .catch(() => setExisting(false))
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
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
      setMessage('Profile saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const incomplete = location.state?.incomplete || !isProfileComplete({
    ...form,
    birthDate: form.dateOfBirth,
    yearsOfExperience: form.yearsOfExperience !== '' ? Number(form.yearsOfExperience) : null,
  });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-primary">My Profile</h1>
      <p className="mt-1 text-muted">Complete your profile to apply for county vacancies</p>

      {incomplete && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            Your profile is incomplete. All fields are required before you can apply.
          </p>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader title="Personal Information" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="National ID" required value={form.nationalId} onChange={update('nationalId')} />
          <Input label="Date of Birth" type="date" required value={form.dateOfBirth} onChange={update('dateOfBirth')} />
          <Select label="Gender" required value={form.gender} onChange={update('gender')}>
            <option value="">Select gender</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </Select>
          <Input label="County" required value={form.county} onChange={update('county')} />
          <Input label="Highest Education Level" required placeholder="e.g. Bachelor's Degree" value={form.educationalLevel} onChange={update('educationalLevel')} />
          <Input label="Years of Experience" type="number" min="0" required value={form.yearsOfExperience} onChange={update('yearsOfExperience')} />
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</div>}
          <Button type="submit" variant="primary" loading={saving}>
            Save Profile
          </Button>
        </form>
      </Card>
    </div>
  );
}
