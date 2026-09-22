const axios = require('axios');
const { StreamChat } = require('stream-chat');
require('dotenv/config');

async function test() {
  try {
    const client = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
    const channels = await client.queryChannels({ type: 'messaging' }, { last_message_at: -1 }, { limit: 1 });
    if (channels.length === 0) { console.log("No channels"); return; }
    const channel = channels[0];
    console.log("Channel:", channel.id);
    
    console.log("Calling start-ai-agent...");
    await axios.post('http://localhost:3001/api/start-ai-agent', { channel_id: channel.id }, { withCredentials: true });
    console.log("Agent started.");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const members = await channel.queryMembers({});
    const userId = members.members.find(m => !m.user_id.startsWith('ai-bot'))?.user_id || 'test_user';
    console.log("Sending as:", userId);
    
    const res = await channel.sendMessage({ text: 'hi test after start', user_id: userId });
    console.log("Sent message id:", res.message.id);
  } catch (err) {
    if (err.response) console.error("Error from backend:", err.response.data);
    else console.error(err.message);
  }
}
test();
