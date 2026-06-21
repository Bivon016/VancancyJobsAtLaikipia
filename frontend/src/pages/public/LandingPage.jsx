import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import VacancyCard from '../../components/vacancies/VacancyCard';
import { jobsApi } from '../../api';

export default function LandingPage() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi
      .getAllOpen()
      .then(({ data }) => setVacancies(data.slice(0, 4)))
      .catch(() => setVacancies([]))
      .finally(() => setLoading(false));
  }, []);

  const departments = new Set(
    vacancies.map((v) => v.department?.departmentName).filter(Boolean)
  );

  return (
    <>
      <section className="relative overflow-hidden bg-primary-dark text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-secondary opacity-95" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Laikipia County Public Service Board
          </p>
          <h1 className="mt-4 max-w-2xl font-heading text-4xl font-bold leading-tight md:text-5xl">
            Building a skilled public service for Laikipia County
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85">
            Explore open vacancies and join teams serving our communities across the county.
            Merit-based recruitment for a transparent, accountable county government.
          </p>
          <Link to="/vacancies" className="mt-8 inline-block">
            <Button variant="accent" size="lg">
              Browse Open Vacancies
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-b bg-white py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-3">
          <StatCard icon={Briefcase} value={vacancies.length || '—'} label="Featured Open Positions" />
          <StatCard icon={Building2} value={departments.size || '—'} label="Departments Hiring" />
          <StatCard icon={Users} value="500+" label="Successful Placements" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">Recent Vacancies</h2>
            <p className="mt-1 text-muted">Latest opportunities with Laikipia County Government</p>
          </div>
          <Link to="/vacancies" className="hidden text-sm font-semibold text-secondary hover:underline sm:block">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : vacancies.length === 0 ? (
          <p className="text-center text-muted">No open vacancies at the moment. Check back soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {vacancies.map((v) => (
              <VacancyCard key={v.id} vacancy={v} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-surface p-6">
      <div className="rounded-full bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="font-heading text-2xl font-bold text-primary">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}
