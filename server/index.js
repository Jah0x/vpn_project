const http = require("http");
const { URL } = require("url");
const crypto = require("crypto");

// In-memory stores
const users = [];
const sessions = {};

function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function parseBody(req, callback) {
  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  req.on("end", () => {
    try {
      const json = JSON.parse(data || "{}");
      callback(null, json);
    } catch (err) {
      callback(err);
    }
  });
}

function createToken() {
  return crypto.randomBytes(16).toString("hex");
}

function authenticate(req) {
  const header = req.headers["authorization"];
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return sessions[token] || null;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "POST" && url.pathname === "/api/register") {
    return parseBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: "Invalid JSON" });
      const { nickname, email, password } = body;
      if (!nickname || !email || !password) {
        return sendJSON(res, 400, { error: "Missing fields" });
      }
      if (users.find((u) => u.nickname === nickname || u.email === email)) {
        return sendJSON(res, 400, { error: "User exists" });
      }
      const id = users.length + 1;
      const user = { id, nickname, email, password };
      users.push(user);
      const token = createToken();
      sessions[token] = user;
      sendJSON(res, 200, { token, user: { id, nickname, email } });
    });
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    return parseBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: "Invalid JSON" });
      const { login, password } = body;
      const user = users.find(
        (u) =>
          (u.email === login || u.nickname === login) &&
          u.password === password,
      );
      if (!user) return sendJSON(res, 401, { error: "Invalid credentials" });
      const token = createToken();
      sessions[token] = user;
      sendJSON(res, 200, {
        token,
        user: { id: user.id, nickname: user.nickname, email: user.email },
      });
    });
  }

  if (req.method === "GET" && url.pathname === "/api/profile") {
    const user = authenticate(req);
    if (!user) return sendJSON(res, 401, { error: "Unauthorized" });
    return sendJSON(res, 200, {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
    });
  }

  res.writeHead(404);
  res.end();
});

if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

module.exports = server;
