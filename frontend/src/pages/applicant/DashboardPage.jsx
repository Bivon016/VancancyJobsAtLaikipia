import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, Briefcase, FileText, User } from 'lucide-react';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/vacancies/StatusBadge';
import { applicationsApi, notificationsApi, profileApi } from '../../api';
import { formatDateTime, isProfileComplete } from '../../utils/constants';

export default function ApplicantDashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  useEffect(() => {
    Promise.all([
      profileApi.get().catch(() => {
        setProfileError(true);
        return { data: null };
      }),
      applicationsApi.getMy().catch(() => ({ data: [] })),
      notificationsApi.getUnread().catch(() => ({ data: [] })),
    ]).then(([prof, apps, notifs]) => {
      setProfile(prof.data);
      setApplications(apps.data);
      setUnreadCount(notifs.data.length);
    }).finally(() => setLoading(false));
  }, []);

  const complete = isProfileComplete(profile);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-2xl font-bold text-primary">Applicant Dashboard</h1>
      <p className="mt-1 text-muted">Welcome to the Laikipia County recruitment portal</p>

      {(profileError || !complete) && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">Profile incomplete</p>
            <p className="mt-1 text-sm text-amber-800">
              Complete your profile before applying for vacancies.
            </p>
            <Link to="/profile" className="mt-2 inline-block">
              <Button variant="accent" size="sm">Complete Profile</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink to="/profile" icon={User} label="My Profile" sub={complete ? 'Complete' : 'Incomplete'} />
        <QuickLink to="/vacancies" icon={Briefcase} label="Browse Vacancies" sub="Find jobs" />
        <QuickLink to="/applications" icon={Briefcase} label="My Applications" sub={`${applications.length} total`} />
        <QuickLink to="/notifications" icon={Bell} label="Notifications" sub={`${unreadCount} unread`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent Applications" />
          {applications.length === 0 ? (
            <p className="text-sm text-muted">No applications yet.</p>
          ) : (
            <ul className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <li key={app.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{app.vacancy?.title}</p>
                    <p className="text-xs text-muted">{formatDateTime(app.applicationDate)}</p>
                  </div>
                  <StatusBadge status={app.applicationStatus} />
                </li>
              ))}
            </ul>
          )}
          <Link to="/applications" className="mt-4 inline-block text-sm text-secondary hover:underline">
            View all →
          </Link>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <div className="space-y-2">
            <Link to="/documents">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4" /> Upload Documents
              </Button>
            </Link>
            <Link to="/vacancies">
              <Button variant="primary" className="w-full justify-start">
                <Briefcase className="h-4 w-4" /> Browse Open Vacancies
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, sub }) {
  return (
    <Link to={to}>
      <Card className="transition-shadow hover:shadow-md">
        <Icon className="h-6 w-6 text-primary" />
        <p className="mt-2 font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted">{sub}</p>
      </Card>
    </Link>
  );
}
