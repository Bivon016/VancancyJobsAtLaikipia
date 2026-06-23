import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import Input, { Select, Textarea } from "../../components/ui/Input";
import { adminApi, departmentsApi } from "../../api";
import { ROLES, ROLE_LABELS } from "../../utils/roles";

const getUserLabel = (user) => {
  if (!user) return "—";
  const name = `${user.fName || ""} ${user.lName || ""}`.trim() || user.email;
  return `${name} — ${user.email}`;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [departmentHeads, setDepartmentHeads] = useState([]);
  const [form, setForm] = useState({
    departmentName: "",
    description: "",
    departmentHeadId: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    departmentsApi.getAll().then(({ data }) => setDepartments(data));

  useEffect(() => {
    load();
    adminApi
      .getUsers([ROLES.DEPT_HEAD])
      .then(({ data }) => setDepartmentHeads(data))
      .catch(() => setDepartmentHeads([]));
  }, []);

  const selectedDepartmentHead = useMemo(
    () =>
      departmentHeads.find(
        (user) => String(user.id) === form.departmentHeadId,
      ) || null,
    [departmentHeads, form.departmentHeadId],
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await departmentsApi.create({
        departmentName: form.departmentName,
        description: form.description,
        departmentHead: Number(form.departmentHeadId),
      });
      setMessage(
        `Department created${selectedDepartmentHead ? ` with head ${getUserLabel(selectedDepartmentHead)}` : "."}`,
      );
      setForm({ departmentName: "", description: "", departmentHeadId: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-bold text-secondary">
        Departments
      </h1>

      <Card className="mt-6">
        <CardHeader title="Create Department" />
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Department Name"
            required
            value={form.departmentName}
            onChange={(e) =>
              setForm({ ...form, departmentName: e.target.value })
            }
          />
          <Textarea
            label="Description"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select
            label="Department Head"
            required
            value={form.departmentHeadId}
            onChange={(e) =>
              setForm({ ...form, departmentHeadId: e.target.value })
            }
          >
            <option value="">Select department head</option>
            {departmentHeads.map((user) => (
              <option key={user.id} value={user.id}>
                {getUserLabel(user)}
              </option>
            ))}
          </Select>
          {selectedDepartmentHead && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Confirming department head:{" "}
              <span className="font-semibold">
                {getUserLabel(selectedDepartmentHead)}
              </span>{" "}
              <span className="text-muted">
                ({ROLE_LABELS[selectedDepartmentHead.role]})
              </span>
            </div>
          )}
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}
          <Button type="submit" loading={loading}>
            Create
          </Button>
        </form>
      </Card>

      <Card className="mt-6">
        <CardHeader
          title="All Departments"
          subtitle={`${departments.length} departments`}
        />
        <ul className="divide-y text-sm">
          {departments.map((d) => (
            <li key={d.id} className="py-3">
              <p className="font-medium">{d.departmentName}</p>
              <p className="text-muted">{d.description}</p>
              <p className="mt-1 text-xs text-slate-500">
                Head: {getUserLabel(d.departmentHead)}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
