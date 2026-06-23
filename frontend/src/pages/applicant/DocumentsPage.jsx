import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FolderOpen, Upload } from "lucide-react";
import Button from "../../components/ui/Button";
import Card, { CardHeader } from "../../components/ui/Card";
import { Select } from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import { applicationsApi, documentsApi } from "../../api";
import { DOCUMENT_TYPES, formatDateTime } from "../../utils/constants";

export default function DocumentsPage() {
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState("CV");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");

  useEffect(() => {
    applicationsApi
      .getMy()
      .then(({ data }) => {
        setApplications(data);
        const preferredApp = location.state?.applicationId;
        if (
          preferredApp &&
          data.some((application) => String(application.id) === preferredApp)
        ) {
          setSelectedApp(preferredApp);
        } else if (data.length) {
          setSelectedApp(String(data[0].id));
        }
      })
      .finally(() => setLoading(false));
  }, [location.state]);

  useEffect(() => {
    if (!selectedApp) return;
    documentsApi
      .getMyByApplication(selectedApp)
      .then(({ data }) => setDocuments(data))
      .catch(() => setDocuments([]));
  }, [selectedApp]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedApp) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      await documentsApi.upload(file, docType, selectedApp, (ev) => {
        if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
      });
      setMessage("Document uploaded successfully.");
      setFile(null);
      setProgress(0);
      const { data } = await documentsApi.getMyByApplication(selectedApp);
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Applicant workspace
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">
            My Documents
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Upload supporting documents once you have an application in
            progress.
          </p>
        </div>
        <Card className="mt-8">
          <EmptyState
            title="No applications yet"
            description="Apply for a vacancy first, then upload supporting documents for that application."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Applicant workspace
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary">
          My Documents
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Upload supporting documents for each application and keep your records
          ready for review.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-white to-slate-50">
            <CardHeader
              title="Upload Document"
              subtitle="Attach the correct document type to the selected application."
            />
            <form onSubmit={handleUpload} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                  label="Application"
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.vacancy?.title} —{" "}
                      {formatDateTime(app.applicationDate)}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Document Type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  {DOCUMENT_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="rounded-[24px] border-2 border-dashed border-slate-300 bg-slate-50/80 p-8 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">
                  {file
                    ? file.name
                    : "Drag and drop a file here, or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Accepted formats: PDF, JPG, PNG, DOC, DOCX
                </p>
                <input
                  type="file"
                  className="mt-4 text-sm"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>

              {progress > 0 && uploading && (
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                  {message}
                </div>
              )}

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-xl"
                  loading={uploading}
                  disabled={!file}
                >
                  Upload Document
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader
              title="Uploaded Documents"
              subtitle="Documents already attached to the selected application."
            />
            {documents.length === 0 ? (
              <p className="text-sm text-muted">
                No documents uploaded for this application.
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {doc.documentType}
                      </p>
                      <p className="text-xs text-muted">
                        Uploaded {formatDateTime(doc.uploadDate)}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Stored
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="h-fit bg-gradient-to-br from-primary via-primary to-primary-light text-white">
          <div className="flex items-start gap-3">
            <FolderOpen className="mt-1 h-6 w-6 flex-none text-accent" />
            <div>
              <h3 className="font-heading text-lg font-bold">
                Document checklist
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Upload clear, relevant files so your application can move
                through review without delays.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            {[
              "Choose the correct application before uploading.",
              "Match each file to the right document category.",
              "Use readable scans or PDFs with full pages visible.",
              "Update files whenever improved copies are available.",
            ].map((tip, index) => (
              <div
                key={tip}
                className="flex items-start gap-3 rounded-xl bg-white/10 px-3 py-3"
              >
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent font-semibold text-primary-dark">
                  {index + 1}
                </span>
                <p className="leading-6 text-white/90">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
