import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card variant="plain" className="max-w-md text-center">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Access Denied
        </h1>
        <p className="mt-2 text-muted">
          You do not have permission to view this page. Contact your
          administrator if you believe this is an error.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="primary">Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
