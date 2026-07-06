import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const { surveyId } = await req.json();

  await pool.query(
    `
    UPDATE surveys
    SET status='pending'
    WHERE id=?
    `,
    [surveyId]
  );

  return NextResponse.json({
    success: true,
  });
}