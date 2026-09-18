import express from "express";
import { requireApiAuth, createSessionToken } from "../auth.js";
import { serverClient } from "../serverClient.js";
import { createAgent } from "../agents/createAgent.js";
import { AgentPlatform } from "../agents/types.js";

const router = express.Router();

// Map to store the AI Agent instances: [user_id string]: AI Agent
const aiAgentCache = new Map();
const pendingAiAgents = new Set();

// TODO: temporary set to 8 hours, should be cleaned up at some point
const inactivityThreshold = 480 * 60 * 1000;

// Periodically check for inactive AI agents and dispose of them
setInterval(async () => {
  const now = Date.now();
  for (const [userId, aiAgent] of aiAgentCache) {
    if (now - aiAgent.getLastInteraction() > inactivityThreshold) {
      console.log(`Disposing AI Agent due to inactivity: ${userId}`);
      await disposeAiAgent(aiAgent);
      aiAgentCache.delete(userId);
    }
  }
}, 5000);

// Generate a Stream Chat token for the authenticated user
router.post("/token", requireApiAuth, async (req, res) => {
  try {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiration = issuedAt + 60 * 60; // 1 hour
    const token = serverClient.createToken(req.user.id, expiration, issuedAt);
    res.json({ token, userId: req.user.id });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Generate a Stream Chat token for guest users (no auth required)
router.post("/token/guest", async (req, res) => {
  try {
    const { guestId } = req.body;
    if (!guestId || !guestId.startsWith("guest-")) {
      return res.status(400).json({ error: "Invalid guest ID" });
    }
    // Upsert guest user in Stream so they can connect
    await serverClient.upsertUser({ id: guestId, name: "Guest", role: "user" });
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiration = issuedAt + 60 * 60; // 1 hour session
    const token = serverClient.createToken(guestId, expiration, issuedAt);
    res.json({ token, userId: guestId });
  } catch (error) {
    console.error("Error generating guest token:", error);
    res.status(500).json({ error: "Failed to generate guest token" });
  }
});


// Also expose session token for frontend use
router.post("/api/session-token", requireApiAuth, (req, res) => {
  const token = createSessionToken(req.user.id);
  res.json({ token, userId: req.user.id, username: req.user.username });
});

// Start AI Agent for a channel
router.post("/start-ai-agent", requireApiAuth, async (req, res) => {
  const { channel_id, channel_type = "messaging" } = req.body;
  console.log(`[API] /start-ai-agent called for channel: ${channel_id}`);

  if (!channel_id) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const user_id = `ai-bot-${channel_id.replace(/[!]/g, "")}`;

  try {
    if (!aiAgentCache.has(user_id) && !pendingAiAgents.has(user_id)) {
      console.log(`[API] Creating new agent for ${user_id}`);
      pendingAiAgents.add(user_id);

      await serverClient.upsertUser({
        id: user_id,
        name: "AI Writing Assistant",
      });

      const channel = serverClient.channel(channel_type, channel_id);
      await channel.addMembers([user_id]);

      const agent = await createAgent(
        user_id,
        AgentPlatform.GEMINI,
        channel_type,
        channel_id
      );

      await agent.init();

      if (aiAgentCache.has(user_id)) {
        await agent.dispose();
      } else {
        aiAgentCache.set(user_id, agent);
      }
    } else {
      console.log(`AI Agent ${user_id} already started or is pending.`);
    }

    res.json({ message: "AI Agent started", data: [] });
  } catch (error) {
    const errorMessage = error.message;
    console.error("Failed to start AI Agent", errorMessage);
    res
      .status(500)
      .json({ error: "Failed to start AI Agent", reason: errorMessage });
  } finally {
    pendingAiAgents.delete(user_id);
  }
});

// Stop AI Agent for a channel
router.post("/stop-ai-agent", requireApiAuth, async (req, res) => {
  const { channel_id } = req.body;
  console.log(`[API] /stop-ai-agent called for channel: ${channel_id}`);
  const user_id = `ai-bot-${channel_id.replace(/[!]/g, "")}`;
  try {
    const aiAgent = aiAgentCache.get(user_id);
    if (aiAgent) {
      console.log(`[API] Disposing agent for ${user_id}`);
      await disposeAiAgent(aiAgent);
      aiAgentCache.delete(user_id);
    } else {
      console.log(`[API] Agent for ${user_id} not found in cache.`);
    }
    res.json({ message: "AI Agent stopped", data: [] });
  } catch (error) {
    const errorMessage = error.message;
    console.error("Failed to stop AI Agent", errorMessage);
    res
      .status(500)
      .json({ error: "Failed to stop AI Agent", reason: errorMessage });
  }
});

// Check AI Agent status
router.get("/agent-status", requireApiAuth, (req, res) => {
  const { channel_id } = req.query;
  if (!channel_id || typeof channel_id !== "string") {
    return res.status(400).json({ error: "Missing channel_id" });
  }
  const user_id = `ai-bot-${channel_id.replace(/[!]/g, "")}`;
  console.log(
    `[API] /agent-status called for channel: ${channel_id} (user: ${user_id})`
  );

  if (aiAgentCache.has(user_id)) {
    res.json({ status: "connected" });
  } else if (pendingAiAgents.has(user_id)) {
    res.json({ status: "connecting" });
  } else {
    res.json({ status: "disconnected" });
  }
});

async function disposeAiAgent(aiAgent) {
  await aiAgent.dispose();
  if (!aiAgent.user) return;
  await serverClient.deleteUser(aiAgent.user.id, {
    hard_delete: true,
  });
}

export default router;
