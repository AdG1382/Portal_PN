import PageShell from '../components/PageShell';

export default function AdminPage() {
  return (
    <PageShell title="Admin">
      <p className="text-sm text-slate-700">Admin area placeholder.</p>
      <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
        <li>TODO: Provision affiliate accounts manually in Supabase Auth.</li>
        <li>TODO: Maintain affiliate profile rows in the affiliates table.</li>
      </ul>
    </PageShell>
  );
}
