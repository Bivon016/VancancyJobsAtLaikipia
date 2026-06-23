import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { useAuth } from "../../auth/AuthContext";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await register(form);
      setSuccess(true);
      setTimeout(
        () =>
          navigate("/verify-email", {
            state: {
              email: result.email,
              message:
                "Account created successfully. Enter the verification code sent to your email.",
            },
          }),
        1200,
      );
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed",
      );
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
            Applicant Registration
          </h1>
          <p className="mt-1 text-sm text-muted">
            Register to apply for county job vacancies
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4 text-center text-sm text-green-800">
            Registration successful! Redirecting to email verification...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                required
                value={form.fName}
                onChange={update("fName")}
              />
              <Input
                label="Last name"
                required
                value={form.lName}
                onChange={update("lName")}
              />
            </div>
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={update("email")}
            />
            <Input
              label="Phone number"
              required
              value={form.phoneNumber}
              onChange={update("phoneNumber")}
            />
            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={update("password")}
            />
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button
              type="submit"
              variant="accent"
              className="w-full"
              loading={loading}
            >
              Create Account
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          Already registered?{" "}
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
