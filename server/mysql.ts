import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function connectMySQL(): Promise<mysql.Pool> {
  if (pool) {
    return pool;
  }

  const host = requiredEnv("MYSQL_HOST");
  const port = parseInt(process.env.MYSQL_PORT || "3306", 10);
  const user = requiredEnv("MYSQL_USER");
  const password = requiredEnv("MYSQL_PASSWORD");
  const database = requiredEnv("MYSQL_DATABASE");

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  await pool.query("SELECT 1");
  return pool;
}

export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    throw new Error("MySQL pool is not initialized. Call connectMySQL() first.");
  }
  return pool;
}
