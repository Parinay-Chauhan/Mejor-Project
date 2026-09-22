import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiResponseHandler } from "./GeminiResponseHandler.js";
import fs from "fs";

class GeminiAgent {
    constructor(chatClient, channel) {
        this.chatClient = chatClient;
        this.channel = channel;
        this.lastInteractionTs = Date.now();
        this.handlers = [];

        this.dispose = async () => {
            this.chatClient.off("message.new", this.handleMessage);
            await this.chatClient.disconnectUser();

            this.handlers.forEach((handler) => handler.dispose());
            this.handlers = [];
        };

        this.getLastInteraction = () => this.lastInteractionTs;

        this.init = async () => {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("GEMINI_API_KEY is required in .env");
            }

            this.genAI = new GoogleGenerativeAI(apiKey);
            // We use the 1.5 flash model which is very fast and suitable for general chat
            this.model = this.genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

            this.channel.on("message.new", this.handleMessage);

            // Check if there are any unreplied messages from the user
            // Check if there are any unreplied messages from the user
            try {
                const messages = this.channel.state?.messages || [];
                if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    // If the last message is from a user, process it
                    if (!lastMessage.ai_generated && (!lastMessage.user || !lastMessage.user.id.startsWith('ai-bot'))) {
                        console.log(`[GeminiAgent] Processing pending message on init: ${lastMessage.text}`);
                        this.handleMessage({ message: lastMessage });
                    }
                }
            } catch (err) {
                console.error("Error checking for pending messages on init:", err);
            }
        };

        this.getSystemInstruction = (context) => {
            const currentDate = new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            return `You are an expert AI Writing Assistant. Your primary purpose is to be a collaborative writing partner.

**Your Core Capabilities:**
- Content Creation, Improvement, Style Adaptation, Brainstorming, and Writing Coaching.
- **Current Date**: Today's date is ${currentDate}. Please use this for any time-sensitive queries.

**Response Format:**
- Be direct and production-ready.
- Use clear formatting.
- **CRITICAL: Keep your responses concise and strictly under 4500 characters in length.**
- Never begin responses with phrases like "Here's the edit:", "Here are the changes:", or similar introductory statements.
- Provide responses directly and professionally without unnecessary preambles.
- **Behavior on Greetings:** If the user just says a simple greeting (like "hi", "hello", "hey"), respond with a very short, simple, and friendly greeting (e.g., "Hello! How can I help you today?"). Do not elaborate, do not mention past templates, and do not write long paragraphs.

**Writing Context**: ${context || "General writing assistance."}`;
        };

        this.handleMessage = async (e) => {
            if (!this.genAI || !this.model) {
                console.log("Gemini not initialized");
                return;
            }

            const eventMessage = e.message;

            if (!eventMessage || eventMessage.ai_generated) {
                return;
            }

            const message = eventMessage.text;
            if (!message) return;

            console.log(`[GeminiAgent] Received message from user: ${message}`);
            fs.appendFileSync('b:\\\\Coding\\\\WebMainProject\\\\Mejor-Project\\\\chatbackend\\\\debug.log', `[GeminiAgent] Received message: ${message}\\n`);
            this.lastInteractionTs = Date.now();

            const writingTask = eventMessage.custom?.writingTask;
            const context = writingTask ? `Writing Task: ${writingTask}` : undefined;
            const instructions = this.getSystemInstruction(context);

            let channelMessage = null;
            try {
                // Dynamically instantiate the model to pass dynamic system instructions
                const model = this.genAI.getGenerativeModel({
                    model: "gemini-3.5-flash",
                    systemInstruction: instructions,
                });

                // To maintain context, we fetch recent messages from the channel
                const messages = this.channel.state?.messages || [];
                
                // Group consecutive messages with the same role to prevent Gemini API errors
                const rawHistory = [];
                for (const msg of messages) {
                    if (msg.id === eventMessage.id) continue; // Skip the current message
                    if (!msg.text) continue;
                    const role = msg.ai_generated || msg.user.id.startsWith('ai-bot') ? "model" : "user";
                    rawHistory.push({ role, text: msg.text });
                }

                const history = [];
                let currentRole = null;
                let currentText = "";

                for (const item of rawHistory) {
                    if (item.role === currentRole) {
                        currentText += "\n\n" + item.text;
                    } else {
                        if (currentRole) {
                            history.push({ role: currentRole, parts: [{ text: currentText }] });
                        }
                        currentRole = item.role;
                        currentText = item.text;
                    }
                }
                if (currentRole) {
                    history.push({ role: currentRole, parts: [{ text: currentText }] });
                }

                // Ensure history starts with 'user'
                if (history.length > 0 && history[0].role === "model") {
                    history.unshift({ role: "user", parts: [{ text: "Hello." }] });
                }

                // Ensure history ends with 'model' before we send a new 'user' message
                if (history.length > 0 && history[history.length - 1].role === "user") {
                    history.push({ role: "model", parts: [{ text: "Okay." }] });
                }

                // Send an empty AI message to show the UI loading state
                const response = await this.channel.sendMessage({
                    text: "",
                    ai_generated: true,
                    user_id: this.chatClient.user.id,
                });
                channelMessage = response.message;

                await this.channel.sendEvent({
                    type: "ai_indicator.update",
                    ai_state: "AI_STATE_THINKING",
                    cid: channelMessage.cid,
                    message_id: channelMessage.id,
                });

                // Fallback mechanism to handle 503 High Demand errors
                const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash"];
                let resultStream = null;
                let lastError = null;

                for (const modelName of modelsToTry) {
                    try {
                        const model = this.genAI.getGenerativeModel({
                            model: modelName,
                            systemInstruction: instructions,
                        });
                        
                        const chat = model.startChat({
                            history: history,
                        });

                        resultStream = await chat.sendMessageStream(message);
                        console.log(`[GeminiAgent] Successfully connected using model: ${modelName}`);
                        break; // Success! Exit the loop
                    } catch (err) {
                        console.log(`[GeminiAgent] Model ${modelName} failed:`, err.message);
                        lastError = err;
                    }
                }

                if (!resultStream) {
                    throw lastError; // If all models failed, throw the last error
                }

                const handler = new GeminiResponseHandler(
                    resultStream.stream,
                    this.chatClient,
                    this.channel,
                    channelMessage,
                    () => this.removeHandler(handler)
                );
                
                this.handlers.push(handler);
                void handler.run();

            } catch (error) {
                console.error("Failed to process message with Gemini:", error);
                if (channelMessage) {
                    try {
                        await this.channel.sendEvent({
                            type: "ai_indicator.update",
                            ai_state: "AI_STATE_ERROR",
                            cid: channelMessage.cid,
                            message_id: channelMessage.id,
                        });
                        await this.chatClient.partialUpdateMessage(channelMessage.id, {
                            set: { text: "⚠️ AI Error: " + (error.message || "Failed to generate response. Please try again.") }
                        });
                    } catch (e) {
                        console.error("Failed to send error fallback to UI:", e);
                    }
                }
            }
        };

        this.removeHandler = (handlerToRemove) => {
            this.handlers = this.handlers.filter(
                (handler) => handler !== handlerToRemove
            );
        };
    }

    get user() {
        return this.chatClient.user;
    }
}

export {
    GeminiAgent,
};
