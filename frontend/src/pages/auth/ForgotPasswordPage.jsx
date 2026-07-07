import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { authApi } from "../../api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      // Always show the same confirmation, whether or not the email
      // exists on an account — this avoids revealing which emails
      // are registered.
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card variant="plain" className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Laikipia County Government
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-primary">
            Forgot Password
          </h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email and we'll send you a link to reset your
            password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              If an account exists for <strong>{email}</strong>, a password
              reset link has been sent. Please check your inbox (and spam
              folder).
            </div>
            <Link to="/login">
              <Button type="button" variant="primary" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Send Reset Link
            </Button>
          </form>
        )}

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
