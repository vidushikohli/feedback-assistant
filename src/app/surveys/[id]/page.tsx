"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  scale_value: number | null;
}

interface Survey {
  id: number;
  title: string;
  questions: Question[];
}

export default function SurveyPage() {
  const params = useParams();

const surveyId = params?.id
  ? Number(Array.isArray(params.id) ? params.id[0] : params.id)
  : null;
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState<Record<number, string | number>>({});

 useEffect(() => {
  if (!surveyId) return;

  async function loadSurvey() {
    try {
      const res = await fetch("/api/generatesurvey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          surveyId,
        }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      setSurvey(data);

      const initialAnswers: Record<number, number> = {};

      data.questions.forEach((q: Question) => {
        if (q.question_type === "rating") {
          initialAnswers[q.id] = 1;
        }
      });

      setAnswers(initialAnswers);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load survey");
    } finally {
      setLoading(false);
    }
  }

  loadSurvey();
}, [surveyId]);

  if (loading) {
    return (
      <div className="p-8">
        <h2>Loading survey...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <h2>Error: {error}</h2>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="p-8">
        <h2>No survey found.</h2>
      </div>
    );
  }
  const handleSubmit = async () => {
  try {

    const response = await fetch("/api/submitsurvey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        surveyId,
        answers,
      }),
    });

    const data = await response.json();

    if (response.ok) {

      const completed = JSON.parse(
        sessionStorage.getItem("completedSurveys") || "[]"
      );

      completed.push(surveyId);

      sessionStorage.setItem(
        "completedSurveys",
        JSON.stringify(completed)
      );

      alert("Survey submitted successfully!");

    } else {

      alert(data.error || "Submission failed");

    }

  } catch (error) {

    console.error(error);

    alert("Error submitting survey");

  }
};

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        {survey.title}
      </h1>
      <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to Portal</Link>

      {survey.questions.map((q) => (
        <div key={q.id} className="mb-8">
          <label className="block font-medium mb-3">
            {q.question_text}
          </label>

          {q.question_type === "rating" && (
            <div>
              <input
                type="range"
                min="1"
                max={q.scale_value || 10}
                value={answers[q.id] || 1}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [q.id]: Number(e.target.value),
                  })
                }
                className="w-full"
              />

              <div className="flex justify-between text-sm mt-2">
                <span>1</span>
                <span>{q.scale_value || 10}</span>
              </div>

              <div className="mt-2 font-semibold">
                Selected Rating: {answers[q.id] || 1}
              </div>
            </div>
          )}

          {q.question_type === "textarea" && (
           <textarea
  rows={4}
  className="w-full border rounded p-3 mt-2"
  placeholder="Enter your answer..."
  value={(answers[q.id] as string) || ""}
  onChange={(e) =>
    setAnswers({
      ...answers,
      [q.id]: e.target.value,
    })
  }
/>
            
          )}
        </div>
      ))}
      <div className="mt-8">
  <button
    onClick={handleSubmit}
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
  >
    Submit Survey
  </button>
</div>
    </div>
    
  );
}