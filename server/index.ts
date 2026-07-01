import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { createServer } from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, getDB, closeDB, healthCheck } from "./db-mongo-updated";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ER_COLLECTIONS: Record<string, string> = {
  users: "users",
  therapists: "therapists",
  appointments: "appointments",
  payments: "payments",
  paymentGateways: "paymentGateways",
  resources: "resources",
  moodEntries: "moodEntries",
  journalEntries: "journalEntries",
  goals: "goals",
  emergencyContacts: "emergencyContacts",
  diagnoses: "diagnoses",
  userDiagnoses: "userDiagnoses",
  assessments: "assessments",
  assessmentQuestions: "assessmentQuestions",
  userAssessments: "userAssessments",
  supervisors: "supervisors",
};

function coerceDocumentValues(input: Record<string, any>): Record<string, any> {
  const output: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "string") {
      output[key] = value;
      continue;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      continue;
    }

    if (/date|schedule/i.test(key)) {
      const date = new Date(trimmed);
      output[key] = Number.isNaN(date.getTime()) ? trimmed : date;
      continue;
    }

    if (/fee|amount|score|mood|lv/i.test(key) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
      output[key] = Number(trimmed);
      continue;
    }

    output[key] = trimmed;
  }

  return output;
}

function buildId(prefix: string): string {
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${Date.now()}-${rand}`;
}

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

  appInstance.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body ?? {};

      if (!username || !email || !password) {
        res.status(400).json({ error: "username, email and password are required" });
        return;
      }

      const db = getDB();
      const users = db.collection("users");

      const existing = await users.findOne({
        $or: [{ username }, { email }],
      });

      if (existing) {
        res.status(409).json({ error: "User with this username or email already exists" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `USR-${Date.now()}`;

      const newUser = {
        userId,
        username,
        email,
        password: passwordHash,
        firstName: firstName || "",
        lastName: lastName || "",
      };

      await users.insertOne(newUser);

      const token = jwt.sign(
        { userId: newUser.userId, email: newUser.email, username: newUser.username },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser.userId,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      res.status(500).json({ error: message });
    }
  });

  appInstance.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body ?? {};

      if (!username || !password) {
        res.status(400).json({ error: "username and password are required" });
        return;
      }

      const db = getDB();
      const users = db.collection("users");
      const user = await users.findOne({ username });

      if (!user || typeof user.password !== "string") {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const isMatch = user.password.startsWith("$2")
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

      if (!isMatch) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign(
        {
          userId: String(user.userId || user._id),
          email: String(user.email || ""),
          username: String(user.username || ""),
        },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: String(user.userId || user._id),
          username: String(user.username || ""),
          email: String(user.email || ""),
          firstName: String(user.firstName || ""),
          lastName: String(user.lastName || ""),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      res.status(500).json({ error: message });
    }
  });

  appInstance.get("/api/therapists", async (_req, res) => {
    try {
      const db = getDB();
      const therapists = await db.collection("therapists").find({}).limit(50).toArray();

      const userIds = therapists
        .map((t) => String((t as any).userId || ""))
        .filter((id) => id.length > 0);

      const users = await db
        .collection("users")
        .find({ userId: { $in: userIds } })
        .project({ userId: 1, firstName: 1, lastName: 1, username: 1, email: 1 })
        .toArray();

      const userMap = new Map(users.map((u) => [String((u as any).userId), u]));

      const data = therapists.map((therapist, index) => {
        const linkedUser = userMap.get(String((therapist as any).userId));
        const firstName = String((linkedUser as any)?.firstName || "").trim();
        const lastName = String((linkedUser as any)?.lastName || "").trim();
        const fallbackName = String((linkedUser as any)?.username || (therapist as any).therapistId || "Therapist");
        const name = `${firstName} ${lastName}`.trim() || fallbackName;

        return {
          therapistId: String((therapist as any).therapistId || ""),
          userId: String((therapist as any).userId || ""),
          name,
          specialization: String((therapist as any).specialization || "General"),
          licenseNo: String((therapist as any).licenseNo || ""),
          consultationFee: 799 + (index % 5) * 200,
          rating: 4.5 + ((index % 4) * 0.1),
          languages: ["English", "Hindi"],
          isOnline: index % 2 === 0,
        };
      });

      res.json({ ok: true, count: data.length, data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch therapists";
      res.status(500).json({ error: message });
    }
  });

  appInstance.post("/api/appointments/checkout", async (req, res) => {
    try {
      const {
        userId,
        therapistId,
        amount,
        method,
        gatewayName,
        transactionFee,
        schedule,
      } = req.body || {};

      if (!userId || !therapistId || !amount || !method || !schedule) {
        res.status(400).json({
          error: "userId, therapistId, amount, method and schedule are required",
        });
        return;
      }

      const db = getDB();
      const selectedGatewayName = String(gatewayName || "Razorpay");
      const parsedSchedule = new Date(schedule);
      if (Number.isNaN(parsedSchedule.getTime())) {
        res.status(400).json({ error: "Invalid schedule value" });
        return;
      }

      const appointment = {
        apptId: buildId("APT"),
        userId: String(userId),
        therapistId: String(therapistId),
        schedule: parsedSchedule,
      };
      await db.collection("appointments").insertOne(appointment);

      let gatewayDoc: any = await db.collection("paymentGateways").findOne({ name: selectedGatewayName });
      if (!gatewayDoc) {
        gatewayDoc = {
          gatewayId: buildId("GTW"),
          name: selectedGatewayName,
          transactionFee: Number(transactionFee || 0),
        };
        await db.collection("paymentGateways").insertOne(gatewayDoc);
      }

      const payment = {
        paymentId: buildId("PAY"),
        apptId: appointment.apptId,
        therapistId: String(therapistId),
        gatewayId: String((gatewayDoc as any).gatewayId),
        amount: Number(amount),
        date: new Date(),
        method: String(method),
      };
      await db.collection("payments").insertOne(payment);

      res.status(201).json({
        ok: true,
        message: "Appointment booked and payment completed",
        appointment,
        payment,
        gateway: {
          gatewayId: String((gatewayDoc as any).gatewayId),
          name: String((gatewayDoc as any).name),
          transactionFee: Number((gatewayDoc as any).transactionFee || 0),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Booking checkout failed";
      res.status(500).json({ error: message });
    }
  });

  appInstance.get("/api/er/:entity", async (req, res) => {
    try {
      const entity = req.params.entity;
      const collectionName = ER_COLLECTIONS[entity];

      if (!collectionName) {
        res.status(404).json({ error: "Unknown entity" });
        return;
      }

      const limit = Math.min(Number(req.query.limit || 25), 100);
      const db = getDB();
      const docs = await db
        .collection(collectionName)
        .find({})
        .sort({ _id: -1 })
        .limit(limit)
        .toArray();

      const sanitized = entity === "users"
        ? docs.map((doc) => ({ ...doc, password: "[REDACTED]" }))
        : docs;

      res.json({ entity, count: sanitized.length, data: sanitized });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch entity";
      res.status(500).json({ error: message });
    }
  });

  appInstance.post("/api/er/:entity", async (req, res) => {
    try {
      const entity = req.params.entity;
      const collectionName = ER_COLLECTIONS[entity];

      if (!collectionName) {
        res.status(404).json({ error: "Unknown entity" });
        return;
      }

      const payload = coerceDocumentValues(req.body || {});
      const db = getDB();
      const result = await db.collection(collectionName).insertOne(payload);

      res.status(201).json({ ok: true, insertedId: String(result.insertedId), entity });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create entity";
      res.status(500).json({ error: message });
    }
  });

  appInstance.get("/api/db-health", async (_req, res) => {
    const result = await healthCheck();
    if (result.ok) {
      res.json(result.details);
    } else {
      res.status(503).json(result.details);
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
  await connectDB();

  const server = await registerRoutes(app);

  if (app.get("env") === "development") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, "../vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        next();
        return;
      }

      try {
        const indexHtmlPath = path.resolve(__dirname, "../client/index.html");
        let template = await fs.readFile(indexHtmlPath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (error) {
        next(error);
      }
    });
  }

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
