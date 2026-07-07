import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { authApi } from "../../api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

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
      await authApi.resetPassword(token, newPassword);
      navigate("/login", {
        replace: true,
        state: {
          message: "Password reset successfully. You can now sign in.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. The link may have expired.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <Card variant="plain" className="w-full max-w-md text-center">
          <h1 className="font-heading text-2xl font-bold text-primary">
            Invalid Reset Link
          </h1>
          <p className="mt-2 text-sm text-muted">
            This password reset link is missing or invalid. Please request a
            new one.
          </p>
          <Link to="/forgot-password">
            <Button type="button" variant="primary" className="mt-6 w-full">
              Request New Link
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card variant="plain" className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Laikipia County Government
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-primary">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-muted">
            Choose a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            autoFocus
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

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={submitting}
          >
            Reset Password
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          <Link
            to="/login"
            className="font-semibold text-secondary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
