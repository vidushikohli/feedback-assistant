import OpenAI from "openai";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function formatResponseData(data: any) {
  if (!data || typeof data !== "object") return "No answer data";

  return Object.entries(data)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(", ");
}

async function getSurveyResponseSamples(surveyId: number) {
  try {
    const [columnRows]: any = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'survey_responses'
    `);

    const columns = columnRows.map((row: any) => row.COLUMN_NAME);

    if (columns.includes("response_data")) {
      const [rows]: any = await pool.query(
        `SELECT response_data FROM survey_responses WHERE survey_id = ? ORDER BY submitted_at DESC LIMIT 3`,
        [surveyId]
      );

      return rows
        .map((row: any) => row.response_data)
        .filter(Boolean)
        .slice(0, 3)
        .map(formatResponseData);
    }

    const [rows]: any = await pool.query(`
      SELECT qr.answer
      FROM survey_responses sr
      JOIN question_responses qr ON qr.response_id = sr.id
      WHERE sr.survey_id = ?
      ORDER BY sr.submitted_at DESC, qr.id DESC
      LIMIT 3
    `, [surveyId]);

    return rows
      .map((row: any) => row.answer)
      .filter(Boolean)
      .slice(0, 3)
      .map((value: any) => String(value));
  } catch (error) {
    console.error("CHATBOT RESPONSE SAMPLE ERROR:", error);
    return [];
  }
}

async function findSurveyByTitle(message: string) {
  const [rows]: any = await pool.query(`
    SELECT id, title
    FROM surveys
    ORDER BY created_at DESC
  `);

  const normalizedMessage = normalizeText(message);

  const directMatch = rows.find((survey: any) => normalizeText(survey.title) === normalizedMessage);
  if (directMatch) return directMatch;

  return rows.find((survey: any) => normalizeText(survey.title).includes(normalizedMessage) || normalizedMessage.includes(normalizeText(survey.title))) || null;
}

async function answerSurveyResponseQuestion(message: string) {
  const lowerMessage = normalizeText(message);
  const isSurveyResponseRequest = /response|responses|answer|answers/.test(lowerMessage);

  if (!isSurveyResponseRequest) return null;

  const survey = await findSurveyByTitle(message);

  if (!survey) {
    return "I can help with survey responses. Please mention the survey title, for example: 'How many responses does the Customer Feedback survey have?'";
  }

  const [countRows]: any = await pool.query(
    `SELECT COUNT(*) AS total FROM survey_responses WHERE survey_id = ?`,
    [survey.id]
  );

  const totalResponses = Number(countRows?.[0]?.total || 0);

  if (totalResponses === 0) {
    return `Survey "${survey.title}" has no responses yet.`;
  }

  const isCountRequest = /how many|count|number of/.test(lowerMessage);

  if (isCountRequest) {
    return `Survey "${survey.title}" has ${totalResponses} response${totalResponses === 1 ? "" : "s"}.`;
  }

  const examples = await getSurveyResponseSamples(survey.id);

  if (examples.length > 0) {
    return `Survey "${survey.title}" has ${totalResponses} response${totalResponses === 1 ? "" : "s"}. Recent response examples: ${examples.join(" | ")}`;
  }

  return `Survey "${survey.title}" has ${totalResponses} response${totalResponses === 1 ? "" : "s"}.`;
}

async function buildContext(role: string) {
  let context = "No information available.";

  try {
    if (role === "user") {
      const [rows]: any = await pool.query(`
        SELECT title
        FROM surveys
        WHERE status = 'approved'
        ORDER BY created_at DESC
        LIMIT 10
      `);

      context = "Available surveys:\n\n" + rows.map((s: any) => `• ${s.title}`).join("\n");
    } else if (role === "admin") {
      const [rows]: any = await pool.query(`
        SELECT
          s.title,
          COUNT(sr.id) AS responses
        FROM surveys s
        LEFT JOIN survey_responses sr ON sr.survey_id = s.id
        GROUP BY s.id
        ORDER BY responses DESC
      `);

      context = "Survey Statistics:\n\n" + rows.map((r: any) => `${r.title}: ${r.responses} responses`).join("\n");
    } else if (role === "coadmin") {
      const [rows]: any = await pool.query(`
        SELECT title
        FROM surveys
        WHERE status = 'inactive'
      `);

      context = "Inactive Surveys:\n\n" + rows.map((s: any) => `• ${s.title}`).join("\n");
    }
  } catch (dbError) {
    console.error("CHATBOT DB ERROR:", dbError);
    context = "Survey data is temporarily unavailable.";
  }

  return context;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message : "";
    const role = typeof body?.role === "string" ? body.role : "user";
    const normalizedRole = role || "user";
    const context = await buildContext(normalizedRole);

    const surveyAnswer = await answerSurveyResponseQuestion(message);
    if (surveyAnswer) {
      return NextResponse.json({ response: surveyAnswer });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const isConfigured = Boolean(apiKey && apiKey !== "sk-xxxxxxxxxxxx" && apiKey.startsWith("sk-"));

    if (!isConfigured) {
      return NextResponse.json({
        response: `The chatbot is not configured yet. ${context}`,
      });
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI Survey Assistant. Use the information below to answer the user.\n\n${context}\n\nBe concise and helpful.`,
        },
        {
          role: "user",
          content: message || "Hello",
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "No response generated.";
    return NextResponse.json({ response: reply });
  } catch (err) {
    console.error("CHATBOT ERROR:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
