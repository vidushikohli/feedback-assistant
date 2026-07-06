import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { surveyId } = await req.json();

    if (!surveyId) {
      return NextResponse.json(
        { error: "surveyId is required" },
        { status: 400 }
      );
    }

    // Get survey details
    const [surveyRows]: any = await pool.query(
      "SELECT id, title FROM surveys WHERE id = ?",
      [surveyId]
    );

    if (surveyRows.length === 0) {
      return NextResponse.json(
        { error: "Survey not found" },
        { status: 404 }
      );
    }

    // Get questions for this survey only
    const [questions] = await pool.query(
  `SELECT
      id,
      question_text,
      question_type,
      scale_value
   FROM survey_questions
   WHERE survey_id = ?
   ORDER BY id`,
  [surveyId]
);

    return NextResponse.json({
      title: surveyRows[0].title,
      questions,
    });
  } catch (error) {
    console.error("Generate Survey Error:", error);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}