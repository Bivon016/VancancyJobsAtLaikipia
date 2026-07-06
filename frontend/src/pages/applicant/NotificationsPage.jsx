import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, CheckCheck } from "lucide-react";
import Card, { CardHeader } from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { notificationsApi } from "../../api";
import { formatDateTime } from "../../utils/constants";

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

// Notifications like "Start it here: http://.../interview/{token}" store a
// raw URL in the message text. Render it as an actual clickable action
// (using client-side routing when it points at our own app) instead of a
// flat string the applicant has to copy-paste.
function renderMessageWithLinks(message) {
  const parts = message.split(URL_PATTERN);
  return parts.map((part, i) => {
    if (!URL_PATTERN.test(part)) {
      URL_PATTERN.lastIndex = 0;
      return <span key={i}>{part}</span>;
    }
    URL_PATTERN.lastIndex = 0;
    try {
      const url = new URL(part);
      if (url.origin === window.location.origin) {
        return (
          <Link key={i} to={url.pathname} className="font-semibold text-primary underline">
            Open in portal
          </Link>
        );
      }
    } catch {
      // fall through to plain link below
    }
    return (
      <a key={i} href={part} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">
        {part}
      </a>
    );
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await notificationsApi.getMy();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = window.setInterval(() => {
      load();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [load]);

  const handleRead = async (id) => {
    await notificationsApi.markRead(id);
    load();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Applicant workspace
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">
          Notifications
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Updates about your applications, shortlisting, and recruitment
          process.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <MetricCard
          icon={BellRing}
          label="Total notifications"
          value={notifications.length}
          tone="from-blue-500/15 to-cyan-500/10"
        />
        <MetricCard
          icon={CheckCheck}
          label="Unread notifications"
          value={unreadCount}
          tone="from-emerald-500/15 to-teal-500/10"
        />
      </div>

      <Card className="mt-8 bg-gradient-to-br from-white via-white to-slate-50">
        <CardHeader
          title="Notification feed"
          subtitle="Click an unread notification to mark it as read."
        />
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You're all caught up."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
                  !n.isRead
                    ? "border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.08]"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
                onClick={() => !n.isRead && handleRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  {!n.isRead ? (
                    <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-accent" />
                  ) : (
                    <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-slate-200" />
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p
                        className={`text-sm ${!n.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-800"}`}
                      >
                        {n.title}
                      </p>
                      <span className="text-xs text-muted">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {renderMessageWithLinks(n.message)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  return (
    <Card className={`bg-gradient-to-br ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-primary shadow-sm ring-1 ring-slate-200/70">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/70">
          Inbox
        </span>
      </div>
      <p className="mt-8 text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-primary">
        {value}
      </p>
    </Card>
  );
}
