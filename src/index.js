import express from "express";
import { matchRoutes } from "./routes/matches.route.js";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";

const app = express();
const PORT = process.env.PORT || 3000;
const host = "0.0.0.0";

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use("/matches", matchRoutes);

// Attach WebSocket
const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Sportz API" });
});

// ✅ Start HTTP server (NOT app.listen)
server.listen(PORT, host, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket running on ws://localhost:${PORT}/ws`);
});
