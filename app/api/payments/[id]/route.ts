import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getRcdAmountValidationError } from "@/lib/payment-validation";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

async function requireSession(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  return session;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireSession(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json();
  const { or_date, or_no_start, or_no_end, pieces, rcd_amount, collector } = body;

  if (!or_date || !or_no_start || !or_no_end || !pieces || !rcd_amount || !collector)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });

  const rcdAmountError = getRcdAmountValidationError(rcd_amount);
  if (rcdAmountError)
    return NextResponse.json({ error: rcdAmountError }, { status: 400 });

  const start = parseInt(or_no_start);
  const end = parseInt(or_no_end);
  if (isNaN(start) || isNaN(end) || start > end)
    return NextResponse.json({ error: "Invalid O.R. number range." }, { status: 400 });

  const [conflicts] = await pool.execute<RowDataPacket[]>(
    `SELECT id, or_no_start, or_no_end FROM payments
     WHERE id != ?
       AND CAST(or_no_start AS UNSIGNED) <= CAST(? AS UNSIGNED)
       AND CAST(or_no_end   AS UNSIGNED) >= CAST(? AS UNSIGNED)
     LIMIT 1`,
    [numId, end, start]
  );
  if (conflicts.length > 0) {
    const c = conflicts[0];
    return NextResponse.json(
      { error: `O.R. range overlaps with an existing record (${c.or_no_start}–${c.or_no_end}).` },
      { status: 409 }
    );
  }

  await pool.execute<ResultSetHeader>(
    "UPDATE `payments` SET `or_date`=?, `or_no_start`=?, `or_no_end`=?, `pieces`=?, `rcd_amount`=?, `collector`=? WHERE `id`=?",
    [or_date, or_no_start, or_no_end, pieces, rcd_amount, collector, numId]
  );

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM `payments` WHERE `id` = ?",
    [numId]
  );

  const row = rows[0];
  return NextResponse.json({ ...row, rcd_amount: Number(row.rcd_amount) });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireSession(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await pool.execute<ResultSetHeader>(
    "DELETE FROM `payments` WHERE `id` = ?",
    [numId]
  );

  return NextResponse.json({ id: numId });
}
