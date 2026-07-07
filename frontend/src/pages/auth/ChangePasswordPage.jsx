import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { useAuth } from "../../auth/AuthContext";
import { authApi } from "../../api";
import { isAdminRole } from "../../utils/roles";

export default function ChangePasswordPage() {
  const { user, clearMustChangePassword, logout } = useAuth();
  const navigate = useNavigate();
  const forced = !!user?.mustChangePassword;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      clearMustChangePassword();
      navigate(isAdminRole(user?.role) ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password. Check your current password and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/50 px-4 py-12">
      <Card variant="plain" className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Laikipia County Government
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-primary">
            {forced ? "Set Your Own Password" : "Change Password"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {forced
              ? "For security, you must set your own password before continuing."
              : "Update the password on your account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoFocus
          />
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" loading={submitting}>
            Set New Password
          </Button>

          {!forced && (
            <Button type="button" variant="ghost" className="w-full" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          )}
          {forced && (
            <button
              type="button"
              onClick={logout}
              className="w-full text-center text-xs text-muted underline"
            >
              Log out instead
            </button>
          )}
        </form>
      </Card>
    </div>
  );
}
