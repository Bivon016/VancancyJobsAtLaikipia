import Badge from '../ui/Badge';
import { STATUS_LABELS, STATUS_STYLES } from '../../utils/constants';

export default function StatusBadge({ status }) {
  return (
    <Badge className={STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
