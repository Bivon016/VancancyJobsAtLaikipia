import { Link } from "react-router-dom";
import { Building2, Calendar, MapPin } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { formatDate, getVacancyTypeLabel } from "../../utils/constants";

export default function VacancyCard({ vacancy }) {
  return (
    <Card
      variant="plain"
      className="flex flex-col transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-heading text-lg font-bold text-primary">
          {vacancy.title}
        </h3>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
          Open
        </span>
      </div>

      <div className="mb-4 space-y-2 text-sm text-muted">
        {vacancy.department && (
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            {vacancy.department.departmentName}
          </p>
        )}
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {vacancy.positionsAvailable} position
          {vacancy.positionsAvailable !== 1 ? "s" : ""}
        </p>
        {vacancy.salaryScale && (
          <p className="text-gray-600">Salary Scale: {vacancy.salaryScale}</p>
        )}
        <p className="text-gray-600">
          Vacancy Type: {getVacancyTypeLabel(vacancy.vacancyType)}
        </p>
        {vacancy.createdAt && (
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Posted {formatDate(vacancy.createdAt)}
          </p>
        )}
      </div>

      <Link to={`/vacancies/${vacancy.id}`} className="mt-auto">
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </Link>
    </Card>
  );
}
