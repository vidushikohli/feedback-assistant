import { pool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';

export default async function CoadminDashboard() {

  await requireAuth('/coadmin/login');

  // Surveys available to be activated again
  const [templates] = await pool.query(`
    SELECT *
    FROM surveys
    WHERE status = 'inactive'
    ORDER BY title
  `);

  // Survey history
  const [mySurveys] = await pool.query(`
    SELECT *
    FROM surveys
    ORDER BY created_at DESC
  `);

  async function addSurveyFromTemplate(formData) {
    'use server';

    const templateId = formData.get('templateId');

    await pool.query(
      `
      UPDATE surveys
      SET status='pending'
      WHERE id=?
      `,
      [templateId]
    );

    revalidatePath('/coadmin');
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
  }

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-10">

      <header className="flex justify-between items-center border-b pb-4">

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Coadmin Dashboard
          </h1>

          <p className="text-sm text-gray-500">
            Add surveys for admin approval
          </p>
        </div>

        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Logout
        </Link>

      </header>

      {/* Available Surveys */}

      <section className="space-y-4">

        <h2 className="text-xl font-bold text-gray-800">
          📋 Available Surveys
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">

          {templates.length === 0 ? (

            <div className="bg-white border rounded-xl p-6">

              <p className="text-gray-500">
                No inactive surveys available.
              </p>

            </div>

          ) : (

            templates.map((tpl) => (

              <div
                key={tpl.id}
                className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between"
              >

                <div>

                  <span className="text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded">

                    {tpl.category}

                  </span>

                  <h3 className="font-bold text-lg mt-2">

                    {tpl.title}

                  </h3>

                  <p className="text-sm text-gray-600 mt-1">

                    {tpl.description}

                  </p>

                </div>

                <form
                  action={addSurveyFromTemplate}
                  className="mt-4"
                >

                  <input
                    type="hidden"
                    name="templateId"
                    value={tpl.id}
                  />

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                  >
                    Add Survey
                  </button>

                </form>

              </div>

            ))

          )}

        </div>

      </section>


      {/* Survey Status */}

      <section className="space-y-4">

        <h2 className="text-xl font-bold text-gray-800">

          ⏳ Survey Status

        </h2>

        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">

          {mySurveys.length === 0 ? (

            <p className="p-6 text-center text-gray-500">

              No surveys found.

            </p>

          ) : (

            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50">

                <tr>

                  <th className="p-4 text-left">
                    Survey
                  </th>

                  <th className="p-4 text-left">
                    Date Created
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-200">

                {mySurveys.map((survey) => (

                  <tr key={survey.id}>

                    <td className="p-4 font-medium">

                      {survey.title}

                    </td>

                    <td className="p-4">

                      {new Date(
                        survey.created_at
                      ).toLocaleDateString()}

                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          survey.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : survey.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >

                        {survey.status}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </section>

    </main>
  );

}
