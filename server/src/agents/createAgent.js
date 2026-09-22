import { StreamChat } from "stream-chat";
import { apiKey, serverClient } from "../serverClient.js";
import { OpenAIAgent } from "./openai/OpenAiAgent.js";
import { GeminiAgent } from "./gemini/GeminiAgent.js";
import { AgentPlatform } from "./types.js";
const createAgent = async (
    user_id,
    platform,
    channel_type,
    channel_id
) => {
    const token = serverClient.createToken(user_id);
    // This is the client for the AI bot user
    const chatClient = new StreamChat(apiKey, {
        allowServerSideConnect: true,
        timeout: 60000
    });

    await chatClient.connectUser({ id: user_id }, token);
    const channel = chatClient.channel(channel_type, channel_id);
    await channel.watch();

    switch (platform) {
        case AgentPlatform.WRITING_ASSISTANT:
        case AgentPlatform.OPENAI:
            return new OpenAIAgent(chatClient, channel);
        case AgentPlatform.GEMINI:
            return new GeminiAgent(chatClient, channel);
        default:
            throw new Error(`Unsupported agent platform: ${platform}`);
    }
};

export {
    createAgent,
};
