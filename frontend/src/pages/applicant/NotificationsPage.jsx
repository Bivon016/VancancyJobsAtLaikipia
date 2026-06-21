import { useEffect, useState } from 'react';
import Card, { CardHeader } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { notificationsApi } from '../../api';
import { formatDateTime } from '../../utils/constants';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationsApi
      .getMy()
      .then(({ data }) => setNotifications(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleRead = async (id) => {
    await notificationsApi.markRead(id);
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-primary">Notifications</h1>
      <p className="mt-1 text-muted">Updates about your applications and recruitment process</p>

      <Card className="mt-6">
        {notifications.length === 0 ? (
          <EmptyState title="No notifications" description="You're all caught up." />
        ) : (
          <ul className="divide-y">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`cursor-pointer py-4 transition-colors hover:bg-gray-50 ${!n.isRead ? 'bg-primary/5' : ''}`}
                onClick={() => !n.isRead && handleRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  {!n.isRead && (
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                  )}
                  <div className={!n.isRead ? 'font-semibold' : ''}>
                    <p className="text-sm">{n.title}</p>
                    <p className="mt-1 text-sm text-muted">{n.message}</p>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
