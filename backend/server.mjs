import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "_data");
const port = Number(process.env.API_PORT || 8787);

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, jsonHeaders);
  res.end(JSON.stringify(body));
}

function parseIntOr(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function readJson(fileName) {
  try {
    const fullPath = path.join(dataDir, fileName);
    const content = (await readFile(fullPath, "utf-8")).replace(/^\uFEFF/, "").trimStart();
    return JSON.parse(content);
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to load ${fileName}: ${details}`);
  }
}

function normalizeRoleKey(member) {
  const roleKey = String(member.role_key || "").toLowerCase().trim();
  if (roleKey === "mentor" || roleKey === "member") return roleKey;
  const role = String(member.role || "").toLowerCase();
  return role.includes("mentor") ? "mentor" : "member";
}

function inferTeamCode(team) {
  const haystack = `${team.code || ""} ${team.name || ""} ${team.image || ""}`.toLowerCase();
  if (/brt|bio/.test(haystack)) return "BRT";
  if (/srt|stress|finance/.test(haystack)) return "SRT";
  return "";
}

function normalizeTeams(teams) {
  if (!Array.isArray(teams)) return [];
  return teams
    .map((team) => {
      if (!team || typeof team !== "object") return null;
      const code = String(team.code || inferTeamCode(team)).toUpperCase();
      const name = String(team.name || code || "").trim();
      const image = String(team.image || "").trim();
      return { code, name, image };
    })
    .filter(Boolean);
}

async function getNews(params) {
  const data = await readJson("news.json");
  const q = String(params.get("q") || "").toLowerCase().trim();
  const category = String(params.get("category") || "All");
  const page = parseIntOr(params.get("page"), 1);
  const limit = Math.min(parseIntOr(params.get("limit"), 10), 100);

  const filtered = data
    .filter((item) => category === "All" || item.category === category)
    .filter((item) => {
      if (!q) return true;
      return (
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.body || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      return String(b.date || "").localeCompare(String(a.date || ""));
    });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  const categories = ["All", ...new Set(data.map((item) => item.category))];

  return { items, total, page, limit, categories };
}

async function getNewsDetail(newsId) {
  const data = await readJson("news.json");
  return data.find((item) => String(item.id) === String(newsId)) || null;
}

async function getMembers(params) {
  const data = await readJson("members.json");
  const q = String(params.get("q") || "").toLowerCase().trim();
  const team = String(params.get("team") || "all").toLowerCase();
  const role = String(params.get("role") || "all").toLowerCase();

  const filtered = data
    .map((member) => {
      const roleKey = normalizeRoleKey(member);
      const teams = normalizeTeams(member.teams);
      return { ...member, role_key: roleKey, teams };
    })
    .filter((member) => {
      if (team === "all") return true;
      const teamCode = team === "bio" ? "BRT" : "SRT";
      return member.teams.some((t) => t.code === teamCode);
    })
    .filter((member) => role === "all" || member.role_key === role)
    .filter((member) => {
      if (!q) return true;
      return (
        String(member.name || "").toLowerCase().includes(q) ||
        String(member.department || "").toLowerCase().includes(q) ||
        String(member.research_scope || "").toLowerCase().includes(q)
      );
    });

  return {
    items: filtered,
    total: filtered.length,
  };
}

async function getPapers(params) {
  const data = await readJson("papers.json");
  const q = String(params.get("q") || "").toLowerCase().trim();
  const page = parseIntOr(params.get("page"), 1);
  const limit = Math.min(parseIntOr(params.get("limit"), 8), 100);

  const filtered = data
    .filter((paper) => {
      if (!q) return true;
      const authors = Array.isArray(paper.authors) ? paper.authors.join(" ") : "";
      return (
        String(paper.title || "").toLowerCase().includes(q) ||
        authors.toLowerCase().includes(q) ||
        String(paper.venue || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if ((b.year || 0) !== (a.year || 0)) return (b.year || 0) - (a.year || 0);
      return String(b.id || "").localeCompare(String(a.id || ""));
    });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page, limit };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? JSON.parse(raw) : {};
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, jsonHeaders);
      res.end();
      return;
    }

    const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = requestUrl.pathname;

    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, { ok: true, service: "neu-brt-srt-api" });
      return;
    }

    if (req.method === "GET" && pathname === "/api/lab") {
      const lab = await readJson("lab.json");
      sendJson(res, 200, lab);
      return;
    }

    if (req.method === "GET" && pathname === "/api/news") {
      sendJson(res, 200, await getNews(requestUrl.searchParams));
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/news/")) {
      const id = decodeURIComponent(pathname.replace("/api/news/", ""));
      const item = await getNewsDetail(id);
      if (!item) {
        sendJson(res, 404, { error: "News item not found" });
        return;
      }
      sendJson(res, 200, item);
      return;
    }

    if (req.method === "GET" && pathname === "/api/members") {
      sendJson(res, 200, await getMembers(requestUrl.searchParams));
      return;
    }

    if (req.method === "GET" && pathname === "/api/papers") {
      sendJson(res, 200, await getPapers(requestUrl.searchParams));
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/login") {
      const body = await readBody(req);
      if (!body.email || !body.password) {
        sendJson(res, 400, { error: "Email and password are required" });
        return;
      }
      sendJson(res, 200, {
        message: "Login successful (demo mode)",
        user: { email: String(body.email) },
      });
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/signup") {
      const body = await readBody(req);
      if (!body.name || !body.email || !body.password) {
        sendJson(res, 400, { error: "Name, email and password are required" });
        return;
      }
      sendJson(res, 201, {
        message: "Signup successful (demo mode)",
        user: { name: String(body.name), email: String(body.email) },
      });
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, {
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] running at http://localhost:${port}`);
});
