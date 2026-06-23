import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { useAuth } from "../../auth/AuthContext";
import { normalizeRole, isAdminRole } from "../../utils/roles";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login(email, password);
      const role = normalizeRole(result.role);
      const dest = isAdminRole(role)
        ? "/admin"
        : from.startsWith("/admin")
          ? "/dashboard"
          : from;
      navigate(dest, { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Invalid email or password";
      setError(errorMessage);
      if (errorMessage.toLowerCase().includes("verify your email")) {
        navigate("/verify-email", {
          state: {
            email,
            message:
              "Your account must be verified before first login. Enter the code sent to your email.",
          },
        });
      }
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
            Sign In
          </h1>
          <p className="mt-1 text-sm text-muted">
            Access the county recruitment portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {location.state?.message && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              {location.state.message}
            </div>
          )}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-muted">
          <p>
            New applicant?{" "}
            <Link
              to="/register"
              className="font-semibold text-secondary hover:underline"
            >
              Create an account
            </Link>
          </p>
          <p>
            Already have a verification code?{" "}
            <Link
              to="/verify-email"
              className="font-semibold text-secondary hover:underline"
            >
              Verify your email
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
