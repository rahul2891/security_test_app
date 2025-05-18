const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

const PORT = 4000;

// In-memory store for tab sessions
const activeTabSessions = {};

app.post("/login", (req, res) => {
  const { tabId } = req.body;
  const token = "FAKE_TOKEN_123"; // replace with JWT in real apps

  // If user already logged in from a different tab, reject or overwrite
  for (let session in activeTabSessions) {
    if (activeTabSessions[session] === token && session !== tabId) {
      return res
        .status(403)
        .json({ error: "Already logged in from another tab." });
    }
  }

  activeTabSessions[tabId] = token;
  return res.json({ success: true, token });
});

app.get("/protected", (req, res) => {
  const authHeader = req.headers.authorization;
  const tabId = req.headers["x-tab-id"];

  if (!authHeader || !tabId) {
    return res.status(401).json({ error: "Missing token or tab ID" });
  }

  const token = authHeader.split(" ")[1];
  if (activeTabSessions[tabId] !== token) {
    return res.status(403).json({ error: "Session not valid for this tab" });
  }

  return res.json({ message: "Protected data accessed successfully!" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
