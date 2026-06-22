import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { authApi } from "../../api";
import { useAuth } from "../../auth/AuthContext";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    location.state?.message ||
      "Enter the verification code sent to your email.",
  );

  useEffect(() => {
    if (isAuthenticated && location.state?.email) {
      logout();
    }
  }, [isAuthenticated, logout, location.state]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await authApi.verifyEmail(email, code);
      navigate("/login", {
        replace: true,
        state: { message: "Email verified successfully. You can now sign in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Enter your email first to resend the verification code.");
      return;
    }
    setError("");
    setMessage("");
    setResending(true);
    try {
      await authApi.resendVerificationCode(email);
      setMessage("A new verification code has been sent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to resend code",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Laikipia County Government
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-primary">
            Verify Email
          </h1>
          <p className="mt-1 text-sm text-muted">
            Enter the code sent to your email before your first login
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Verification code"
            required
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
          {message && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Verify Email
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleResend}
              loading={resending}
            >
              Resend Code
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already verified?{" "}
          <Link
            to="/login"
            className="font-semibold text-secondary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
