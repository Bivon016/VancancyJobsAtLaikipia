import Button from '../ui/Button';
import Card from '../ui/Card';

export default function ConfirmModal({ title, description, onCancel, onConfirm, confirmLabel = 'Confirm', loading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <Card className="w-full max-w-lg border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
        <h3 className="font-heading text-xl font-bold text-primary">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
