export const dynamic = 'force-dynamic';

import { pool } from '@/lib/db';
import Link from 'next/link';
import './footer.css';
import SurveyList from "@/app/components/SurveyList";
import HomeSurveySection from "@/app/components/HomeSurveySection";
import Chatbot from "@/app/components/Chatbot";

export default async function MainHomePage() {

  let activeSurveys = [];

  try {

   const [rows] = await pool.query(`
SELECT
s.id,
s.title,
s.description
FROM surveys s
WHERE s.status='approved'
AND EXISTS (
SELECT 1
FROM survey_questions q
WHERE q.survey_id=s.id
)
ORDER BY s.created_at DESC
`);
    activeSurveys = rows;

  } catch (error) {

    console.error(
      'Failed to load surveys:',
      error
    );

  }

  return (

   

<div
className="border-l-4 border-blue-600 min-h-screen"
style={{
backgroundImage:'url(/feedback.png)',
backgroundRepeat:'no-repeat',
backgroundPosition:'left -160px center',
backgroundSize:'30%',
backgroundColor:'yellow'
}}
>

 <div className="fixed bottom-6 right-6 z-50">
   <Chatbot />
</div>
<header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">

<span className="text-xl font-bold text-blue-600">

💡 Survey Assistant

</span>

<div className="flex gap-4">

<Link
href="/auth/login"
className="bg-gray-800 text-white px-4 py-2 rounded-lg"
>
Admin Console →
</Link>

<Link
href="/coadmin/login"
className="bg-gray-800 text-white px-4 py-2 rounded-lg"
>
Coadmin Console →
</Link>

</div>

</header>


<main className="max-w-4xl mx-auto p-8 space-y-8 bg-white/80 rounded-lg">

<section className="text-center py-6">

<h1 className="text-4xl font-extrabold text-pink-900">

Welcome to the Feedback Portal

</h1>

<p className="text-gray-500">

Your Feedback is valuable to us

</p>

</section>

<HomeSurveySection surveys={activeSurveys} />

</main>


<footer className="bg-white text-center text-xs py-6 border-t">

© {new Date().getFullYear()}

SurveyPortal App

</footer>

</div>

);

}