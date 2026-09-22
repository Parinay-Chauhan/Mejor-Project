const { StreamChat } = require('stream-chat');
require('dotenv/config');

async function test() {
  const client = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
  const channels = await client.queryChannels({ type: 'messaging' }, { last_message_at: -1 }, { limit: 1 });
  if (channels.length === 0) { console.log("No channels"); return; }
  const channel = channels[0];
  console.log("Channel:", channel.id);
  
  // get members
  const members = await channel.queryMembers({});
  console.log("Members:", members.members.map(m => m.user_id));
  
  // send message as non-bot
  const userId = members.members.find(m => !m.user_id.startsWith('ai-bot'))?.user_id || 'test_user';
  console.log("Sending as:", userId);
  
  const res = await channel.sendMessage({ text: 'hi test', user_id: userId });
  console.log("Sent message id:", res.message.id);
}
test();
