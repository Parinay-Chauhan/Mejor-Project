require("dotenv/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");
async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const history = [];
    history.unshift({ role: "model", parts: [{ text: "Understood. I will act as the writing assistant." }] });
    history.unshift({ role: "user", parts: [{ text: "System Instructions: hello" }] });
    const chat = model.startChat({ history });
    try {
        const result = await chat.sendMessageStream("hi");
        for await (const chunk of result.stream) {
            process.stdout.write(chunk.text());
        }
        console.log("\nSuccess!");
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
