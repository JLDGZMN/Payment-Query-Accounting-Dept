import { createPool } from "mysql2/promise";

export const pool = createPool(process.env.DATABASE_URL!);
