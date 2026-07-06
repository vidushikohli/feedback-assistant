"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SurveyList({ surveys }) {

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {surveys.map((survey) => (
        <div
          key={survey.id}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
        >
          <h3 className="font-bold text-lg">
            {survey.title}
          </h3>

          <p className="text-sm text-gray-600">
            {survey.description}
          </p>

         <Link
  href={`/surveys/${survey.id}`}
  className="mt-5 inline-block text-center bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm py-2 px-4 rounded-lg transition"
>
  Take Survey
</Link>
        </div>
      ))}
    </div>
  );
}