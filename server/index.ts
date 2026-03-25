import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { connectMySQL, getMySQLPool } from "./mysql";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message: string) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${message}`);
}

function serveStatic(appInstance: express.Express) {
  const staticDir = path.resolve(__dirname, "../dist/public");
  appInstance.use(express.static(staticDir));
  appInstance.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

async function registerRoutes(appInstance: express.Express): Promise<Server> {
  appInstance.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "clarity-api" });
  });

  appInstance.get("/api/db-health", async (_req, res) => {
    try {
      const pool = getMySQLPool();
      await pool.query("SELECT 1");
      res.json({ ok: true, database: "mysql" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database check failed";
      res.status(503).json({ ok: false, database: "mysql", error: message });
    }
  });

  return createServer(appInstance);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await connectMySQL();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") !== "development") {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
