import { useEffect, useMemo, useState } from 'react';
import Input, { Select } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import VacancyCard from '../../components/vacancies/VacancyCard';
import { jobsApi, departmentsApi } from '../../api';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function VacancyListPage() {
  const [vacancies, setVacancies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    Promise.all([
      jobsApi.getAllOpen(),
      departmentsApi.getAll().catch(() => ({ data: [] })),
    ])
      .then(([jobsRes, deptRes]) => {
        setVacancies(jobsRes.data);
        setDepartments(deptRes.data);
      })
      .catch(() => setVacancies([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return vacancies.filter((v) => {
      const matchesSearch =
        !search ||
        v.title?.toLowerCase().includes(search.toLowerCase()) ||
        v.jobDescription?.toLowerCase().includes(search.toLowerCase());
      const deptName = v.department?.departmentName || '';
      const matchesDept = !departmentFilter || deptName === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [vacancies, search, departmentFilter]);

  const deptNames = useMemo(() => {
    const fromVacancies = vacancies.map((v) => v.department?.departmentName).filter(Boolean);
    const fromApi = departments.map((d) => d.departmentName).filter(Boolean);
    return [...new Set([...fromVacancies, ...fromApi])].sort();
  }, [vacancies, departments]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary">Open Vacancies</h1>
        <p className="mt-2 text-muted">
          Browse and apply for current job opportunities with Laikipia County Government.
        </p>
      </div>

      <div className="mb-8 grid gap-4 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-3">
        <Input
          label="Search by title"
          placeholder="e.g. Accountant, Engineer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2"
        />
        <Select
          label="Department"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All departments</option>
          {deptNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No vacancies found"
          description="There are no open positions matching your criteria. Try adjusting your filters or check back later."
          action={
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            Showing {filtered.length} open position{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <VacancyCard key={v.id} vacancy={v} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
