class GeminiResponseHandler {
    constructor(
        stream,
        chatClient,
        channel,
        message,
        onDispose
    ) {
        this.stream = stream;
        this.chatClient = chatClient;
        this.channel = channel;
        this.message = message;
        this.onDispose = onDispose;
        this.message_text = "";
        this.chunk_counter = 0;
        this.is_done = false;
        this.last_update_time = 0;
    }

    run = async () => {
        const { cid, id: message_id } = this.message;

        try {
            for await (const chunk of this.stream) {
                if (this.is_done) break;

                const textDelta = chunk.text();
                if (textDelta) {
                    this.message_text += textDelta;
                    
                    // Prevent exceeding Stream Chat's 5000 char limit
                    if (this.message_text.length > 4900) {
                        this.message_text = this.message_text.substring(0, 4900) + "\n\n*[Message truncated due to length limits]*";
                        this.is_done = true; // Stop processing further chunks
                    }

                    const now = Date.now();
                    
                    // Throttle updates to avoid hitting rate limits while still being fast
                    if (now - this.last_update_time > 250) {
                        await this.chatClient.partialUpdateMessage(message_id, {
                            set: { text: this.message_text },
                        });
                        this.last_update_time = now;
                    }
                }
            }

            // Final update to ensure the complete message is saved
            if (!this.is_done) {
                await this.chatClient.partialUpdateMessage(message_id, {
                    set: { text: this.message_text },
                });
                await this.channel.sendEvent({
                    type: "ai_indicator.clear",
                    cid: cid,
                    message_id: message_id,
                });
            }

        } catch (error) {
            console.error("An error occurred during the Gemini run:", error);
            await this.handleError(error);
        } finally {
            await this.dispose();
        }
    };

    dispose = async () => {
        if (this.is_done) {
            return;
        }
        this.is_done = true;
        this.onDispose();
    };

    handleError = async (error) => {
        if (this.is_done) {
            return;
        }
        
        try {
            await this.channel.sendEvent({
                type: "ai_indicator.update",
                ai_state: "AI_STATE_ERROR",
                cid: this.message.cid,
                message_id: this.message.id,
            });
            await this.chatClient.partialUpdateMessage(this.message.id, {
                set: {
                    text: error.message ?? "Error generating the message from Gemini",
                },
            });
        } catch (e) {
            console.error("Failed to send error message to channel (rate limit?):", e.message);
        }
        
        await this.dispose();
    };
}

export {
    GeminiResponseHandler,
};
