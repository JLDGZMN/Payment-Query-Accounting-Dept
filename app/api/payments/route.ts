import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

async function requireSession(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  return session;
}

export async function GET(request: NextRequest) {
  if (!await requireSession(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM `payments` ORDER BY `or_date` DESC, `id` DESC"
  );

  const payments = rows.map((r) => ({
    ...r,
    rcd_amount: Number(r.rcd_amount),
  }));

  return NextResponse.json(payments);
}

export async function POST(request: NextRequest) {
  if (!await requireSession(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { or_date, or_no_start, or_no_end, pieces, rcd_amount, collector } = body;

  if (!or_date || !or_no_start || !or_no_end || !pieces || !rcd_amount || !collector)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });

  const start = parseInt(or_no_start);
  const end = parseInt(or_no_end);
  if (isNaN(start) || isNaN(end) || start > end)
    return NextResponse.json({ error: "Invalid O.R. number range." }, { status: 400 });

  const [conflicts] = await pool.execute<RowDataPacket[]>(
    `SELECT id, or_no_start, or_no_end FROM payments
     WHERE CAST(or_no_start AS UNSIGNED) <= CAST(? AS UNSIGNED)
       AND CAST(or_no_end   AS UNSIGNED) >= CAST(? AS UNSIGNED)
     LIMIT 1`,
    [end, start]
  );
  if (conflicts.length > 0) {
    const c = conflicts[0];
    return NextResponse.json(
      { error: `O.R. range overlaps with an existing record (${c.or_no_start}–${c.or_no_end}).` },
      { status: 409 }
    );
  }

  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO `payments` (`or_date`, `or_no_start`, `or_no_end`, `pieces`, `rcd_amount`, `collector`) VALUES (?, ?, ?, ?, ?, ?)",
    [or_date, or_no_start, or_no_end, pieces, rcd_amount, collector]
  );

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM `payments` WHERE `id` = ?",
    [result.insertId]
  );

  const row = rows[0];
  return NextResponse.json({ ...row, rcd_amount: Number(row.rcd_amount) }, { status: 201 });
}
