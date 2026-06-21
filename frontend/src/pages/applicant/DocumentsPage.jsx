import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { applicationsApi, documentsApi } from '../../api';
import { DOCUMENT_TYPES, formatDateTime } from '../../utils/constants';

export default function DocumentsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState('');
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState('CV');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    applicationsApi.getMy().then(({ data }) => {
      setApplications(data);
      if (data.length) setSelectedApp(String(data[0].id));
    });
  }, []);

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
    setError('');
    setMessage('');
    try {
      await documentsApi.upload(file, docType, selectedApp, (ev) => {
        if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
      });
      setMessage('Document uploaded successfully.');
      setFile(null);
      setProgress(0);
      const { data } = await documentsApi.getMyByApplication(selectedApp);
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  if (applications.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-bold text-primary">My Documents</h1>
        <EmptyState
          title="No applications yet"
          description="Apply for a vacancy first, then upload supporting documents for that application."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-primary">My Documents</h1>
      <p className="mt-1 text-muted">Upload supporting documents for your applications</p>

      <Card className="mt-6">
        <CardHeader title="Select Application" />
        <Select value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)}>
          {applications.map((app) => (
            <option key={app.id} value={app.id}>
              {app.vacancy?.title} — {formatDateTime(app.applicationDate)}
            </option>
          ))}
        </Select>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Upload Document" />
        <form onSubmit={handleUpload} className="space-y-4">
          <Select label="Document Type" value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOCUMENT_TYPES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </Select>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center"
          >
            <Upload className="mb-2 h-8 w-8 text-muted" />
            <p className="text-sm text-muted">
              {file ? file.name : 'Drag & drop a file here, or click to browse'}
            </p>
            <input
              type="file"
              className="mt-3 text-sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>

          {progress > 0 && uploading && (
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</div>}

          <Button type="submit" variant="primary" loading={uploading} disabled={!file}>
            Upload
          </Button>
        </form>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Uploaded Documents" />
        {documents.length === 0 ? (
          <p className="text-sm text-muted">No documents uploaded for this application.</p>
        ) : (
          <ul className="divide-y">
            {documents.map((doc) => (
              <li key={doc.id} className="flex justify-between py-3 text-sm">
                <span className="font-medium">{doc.documentType}</span>
                <span className="text-muted">{formatDateTime(doc.uploadDate)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
