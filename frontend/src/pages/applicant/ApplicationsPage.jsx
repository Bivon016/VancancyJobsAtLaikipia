import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/vacancies/StatusBadge';
import Button from '../../components/ui/Button';
import { applicationsApi } from '../../api';
import { formatDateTime } from '../../utils/constants';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    applicationsApi
      .getMy()
      .then(({ data }) => setApplications(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-bold text-primary">My Applications</h1>
      <p className="mt-1 text-muted">Track the status of your job applications</p>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse open vacancies and submit your first application."
          action={
            <Link to="/vacancies">
              <Button variant="primary">Browse Vacancies</Button>
            </Link>
          }
        />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {applications.map((app) => (
              <Card
                key={app.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${selected?.id === app.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelected(app)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{app.vacancy?.title}</p>
                    <p className="text-xs text-muted">{app.vacancy?.department?.departmentName}</p>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(app.applicationDate)}</p>
                  </div>
                  <StatusBadge status={app.applicationStatus} />
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader title="Application Details" />
            {selected ? (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Position</dt>
                  <dd className="font-medium">{selected.vacancy?.title}</dd>
                </div>
                <div>
                  <dt className="text-muted">Department</dt>
                  <dd>{selected.vacancy?.department?.departmentName}</dd>
                </div>
                <div>
                  <dt className="text-muted">Submitted</dt>
                  <dd>{formatDateTime(selected.applicationDate)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Status</dt>
                  <dd className="mt-1"><StatusBadge status={selected.applicationStatus} /></dd>
                </div>
                {selected.remarks && (
                  <div>
                    <dt className="text-muted">Remarks</dt>
                    <dd>{selected.remarks}</dd>
                  </div>
                )}
                <Link to="/documents">
                  <Button variant="outline" size="sm" className="mt-2">
                    Manage Documents
                  </Button>
                </Link>
              </dl>
            ) : (
              <p className="text-sm text-muted">Select an application to view details.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
