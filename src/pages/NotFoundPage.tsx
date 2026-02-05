import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function NotFoundPage() {
  return (
    <PageShell title="Page not found">
      <p className="text-sm text-slate-600">The page you requested does not exist.</p>
      <Link to="/register" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
        Go to registration
      </Link>
    </PageShell>
  );
}
