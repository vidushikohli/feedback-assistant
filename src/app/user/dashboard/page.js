import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  await requireAuth('/auth/login');

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Placeholder page — implement UI here.</p>
    </div>
  );
}
