"use client";

import { useEffect, useState } from "react";
import SurveyList from "./SurveyList";

export default function HomeSurveySection({ surveys }) {

  const [visibleSurveys, setVisibleSurveys] = useState([]);

  useEffect(() => {

    const completed = JSON.parse(
      sessionStorage.getItem("completedSurveys") || "[]"
    );

    const filtered = surveys.filter(
      survey => !completed.includes(survey.id)
    );

    setVisibleSurveys(filtered);

  }, [surveys]);

  return (

    <section className="space-y-4">

      <h2 className="text-xl font-bold border-b pb-2">

        📋 Available Surveys
        ({visibleSurveys.length})

      </h2>

      {visibleSurveys.length === 0 ? (

        <div className="bg-white border rounded-xl p-12 text-center">

          <p>No live surveys found.</p>

        </div>

      ) : (

        <SurveyList surveys={visibleSurveys} />

      )}

    </section>

  );

}