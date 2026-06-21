import { useEffect, useState } from 'react';
import { Download, FileText, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import Card, { CardHeader } from '../ui/Card';
import { downloadPdf, generateListPdf, openPdfInNewTab } from '../../utils/pdfExport';

export default function PdfReportView({
  title,
  subtitle,
  columns,
  buildRows,
  filename,
  fetchData,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfResult, setPdfResult] = useState(null);
  const [rowCount, setRowCount] = useState(0);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);

    try {
      const data = await fetchData();
      const rows = buildRows(data);
      setRowCount(rows.length);

      if (rows.length === 0) {
        setPdfUrl(null);
        setPdfResult(null);
        return;
      }

      const result = generateListPdf({
        title,
        subtitle,
        columns,
        rows,
        filename,
      });
      setPdfResult(result);
      setPdfUrl(URL.createObjectURL(result.blob));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={loadReport} loading={loading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {pdfResult && (
              <>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => downloadPdf(pdfResult)}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openPdfInNewTab(pdfResult)}
                >
                  Open in Tab
                </Button>
              </>
            )}
          </div>
        }
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && rowCount === 0 && (
        <div className="flex flex-col items-center py-16 text-center text-muted">
          <FileText className="mb-3 h-10 w-10" />
          <p>No records found for this report.</p>
        </div>
      )}

      {!loading && pdfUrl && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <iframe
            src={pdfUrl}
            title={title}
            className="h-[70vh] w-full bg-white"
          />
        </div>
      )}
    </Card>
  );
}
