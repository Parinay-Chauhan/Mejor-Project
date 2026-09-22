import { StreamChat } from "stream-chat";

function getServerClient() {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Missing required environment variables STREAM_API_KEY or STREAM_API_SECRET"
    );
  }

  return StreamChat.getInstance(apiKey, apiSecret, { timeout: 60000 });
}

// Lazy singleton — created on first use, after dotenv has loaded
let _serverClient;

function getClient() {
  if (!_serverClient) {
    _serverClient = getServerClient();
  }
  return _serverClient;
}

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Proxy that initializes on first property access
const serverClient = new Proxy(
  {},
  {
    get(_target, prop) {
      return getClient()[prop];
    },
  }
);

export { apiKey, apiSecret, serverClient };
