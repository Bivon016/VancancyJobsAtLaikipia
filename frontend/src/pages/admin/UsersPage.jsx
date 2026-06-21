import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input, { Select } from '../../components/ui/Input';
import { adminApi } from '../../api';
import { ROLES, ROLE_LABELS } from '../../utils/roles';

export default function UsersPage() {
  const [form, setForm] = useState({
    fName: '',
    lName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: ROLES.HR_OFFICER,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await adminApi.createUser(form);
      setMessage('User created successfully.');
      setForm({ fName: '', lName: '', email: '', password: '', phoneNumber: '', role: ROLES.HR_OFFICER });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-heading text-2xl font-bold text-secondary">User Management</h1>
      <Card className="mt-6">
        <CardHeader title="Create System User" subtitle="Register staff accounts for the recruitment portal" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" required value={form.fName} onChange={update('fName')} />
            <Input label="Last name" required value={form.lName} onChange={update('lName')} />
          </div>
          <Input label="Email" type="email" required value={form.email} onChange={update('email')} />
          <Input label="Phone" required value={form.phoneNumber} onChange={update('phoneNumber')} />
          <Input label="Password" type="password" required value={form.password} onChange={update('password')} />
          <Select label="Role" value={form.role} onChange={update('role')}>
            {Object.values(ROLES).filter((r) => r !== ROLES.APPLICANT).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </Select>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</div>}
          <Button type="submit" loading={loading}>Create User</Button>
        </form>
      </Card>
    </div>
  );
}
