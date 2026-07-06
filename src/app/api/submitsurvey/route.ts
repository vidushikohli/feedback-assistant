import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {

  try {

    const { surveyId, answers } = await request.json();

    // Create survey response record
    const [responseResult]: any = await pool.query(
      `
      INSERT INTO survey_responses (survey_id)
      VALUES (?)
      `,
      [surveyId]
    );

    const responseId = responseResult.insertId;

    // Save all answers
    for (const [questionId, answer] of Object.entries(answers)) {

      await pool.query(
        `
        INSERT INTO question_responses
        (
          response_id,
          question_id,
          answer
        )
        VALUES (?, ?, ?)
        `,
        [
          responseId,
          Number(questionId),
          answer
        ]
      );

    }

    // Hide survey after submission
    await pool.query(
      `
      UPDATE surveys
      SET status='inactive'
      WHERE id=?
      `,
      [surveyId]
    );

    return NextResponse.json({
      success: true,
      responseId
    });

  }

  catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: String(error)
      },
      {
        status: 500
      }
    );

  }

}