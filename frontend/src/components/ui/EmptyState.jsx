import { FileText } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <FileText className="h-8 w-8 text-muted" />
      </div>
      <h3 className="font-heading text-lg font-bold text-gray-800">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
