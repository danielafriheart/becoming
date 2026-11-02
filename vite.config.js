import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import submitLeadHandler from "./api/submit-lead.js";

function localLeadApi() {
  return {
    name: "local-lead-api",
    configureServer(server) {
      server.middlewares.use("/api/submit-lead", async (req, res) => {
        const sendJson = (status, body) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };

        if (req.method !== "POST") {
          res.setHeader("Allow", "POST");
          sendJson(405, { ok: false, error: "Method not allowed." });
          return;
        }

        try {
          const chunks = [];
          let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 10_000) {
              sendJson(413, { ok: false, error: "Request body is too large." });
              return;
            }
            chunks.push(chunk);
          }

          let body;
          try {
            body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          } catch {
            sendJson(400, { ok: false, error: "Invalid request body." });
            return;
          }

          await submitLeadHandler(
            { method: req.method, body },
            {
              setHeader: (name, value) => res.setHeader(name, value),
              status(status) {
                res.statusCode = status;
                return this;
              },
              json(value) {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(value));
                return this;
              },
            },
          );
        } catch (error) {
          console.error("Local lead submission API failed.", error);
          if (!res.writableEnded) {
            sendJson(500, { ok: false, error: "Could not process submission." });
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.GOOGLE_APPS_SCRIPT_URL) {
    process.env.GOOGLE_APPS_SCRIPT_URL = env.GOOGLE_APPS_SCRIPT_URL;
  }

  return {
    plugins: [react(), localLeadApi()],
  };
});
