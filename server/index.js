const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const JWT_SECRET = "your-secret-key";

app.post("/login", (req, res) => {
  const { tabId } = req.body;
  if (!tabId) {
    return res.status(400).json({ error: "tabId is required" });
  }
  // Create token with tabId embedded
  const token = jwt.sign({ userId: 1, tabId }, JWT_SECRET, {
    expiresIn: "10m",
  });
  res.json({ token });
});

app.get("/protected", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];
  const requestTabId = req.headers["x-tab-id"];

  if (!token || !requestTabId) {
    return res
      .status(401)
      .json({ error: "Unauthorized - Missing token or tabId" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.tabId !== requestTabId) {
      return res.status(401).json({ error: "Tab ID mismatch - Unauthorized" });
    }

    // Authorized
    res.json({ message: `Protected data for tab ${requestTabId}` });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

app.listen(4000, () => console.log("Server started on http://localhost:4000"));
