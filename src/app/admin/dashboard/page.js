import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminDashboard() {
  await requireAuth('/auth/login');

  const [surveys] = await pool.query('SELECT * FROM surveys ORDER BY created_at DESC');
  
  const pendingSurveys = surveys.filter(s => s.status === 'pending');
  const approvedSurveys = surveys.filter(s => s.status === 'approved');

  // Server Action to approve a survey instantly
  async function approveSurvey(formData) {
    'use server';
    const surveyId = formData.get('surveyId');
    await pool.query('UPDATE surveys SET status = "approved" WHERE id = ?', [surveyId]);
    revalidatePath('/admin/dashboard'); // Refreshes page data instantly
  }

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold border-b pb-4">Admin Dashboard</h1>
      <Link
                          href="/"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          ← Logout
                        </Link>

      {/* SECTION 1: Pending Approvals */}
      <section className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h2 className="text-xl font-semibold text-amber-800 mb-4">⏳ Pending Approvals ({pendingSurveys.length})</h2>
        {pendingSurveys.length === 0 ? <p className="text-sm text-amber-700">No forms waiting for approval.</p> : (
          <div className="grid gap-4">
            {pendingSurveys.map((survey) => (
              <div key={survey.id} className="flex justify-between items-center bg-white p-4 rounded shadow-sm">
                <div>
                  <h3 className="font-bold">{survey.title}</h3>
                  <p className="text-sm text-gray-500">Created by: {survey.created_by}</p>
                </div>
                
                <form action={approveSurvey}>
                  <input type="hidden" name="surveyId" value={survey.id} />
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                    Approve & Publish
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: Active & Approved Surveys */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">✅ Published Surveys ({approvedSurveys.length})</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {approvedSurveys.map((survey) => (
            <div key={survey.id} className="p-4 border rounded shadow-sm hover:shadow-md transition">
              <h3 className="font-bold text-lg">{survey.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{survey.description}</p>
              <div className="flex gap-2">
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}