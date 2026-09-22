import React, { useRef, useState, useEffect } from 'react'
import Header from './Header'
import Input from './Input'
import Chatsection, { defaultMessages } from './Chatsection'
import Open from './Open'
import LoginModal from './LoginModal'
import { StreamChat } from 'stream-chat'
import axios from 'axios'

const apiKey = import.meta.env.VITE_STREAM_API_KEY || "YOUR_STREAM_API_KEY";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://mejor-backend.onrender.com');

const Chat = () => {

  const inputRef = useRef(null);
  const [messages, setMessages] = useState(defaultMessages);
  const [channel, setChannel] = useState(null);
  const [client, setClient] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let chatClient = null;

    const initChat = async () => {
      try {
        // Extract session token from URL if present (after redirect from backend)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('session_token');
        if (urlToken) {
          localStorage.setItem('mejor_session_token', urlToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const sessionToken = localStorage.getItem('mejor_session_token');

        if (sessionToken) {
          // ── LOGGED-IN MODE ──────────────────────────────────────────────
          await initLoggedInMode(sessionToken);
        } else {
          // ── GUEST MODE ──────────────────────────────────────────────────
          await initGuestMode();
        }

      } catch (error) {
        console.error("Failed to initialize chat:", error);
        // On any error, fall back to guest mode
        try {
          await initGuestMode();
        } catch (guestErr) {
          console.error("Guest mode also failed:", guestErr);
        }
      }
    };

    const initLoggedInMode = async (sessionToken) => {
      const axiosConfig = {
        withCredentials: true,
        headers: { Authorization: `Bearer ${sessionToken}` }
      };

      // Fetch Stream token from backend
      const response = await axios.post(`${API_BASE_URL}/token`, {}, axiosConfig);
      const { token, userId } = response.data;

      chatClient = StreamChat.getInstance(apiKey);
      await chatClient.connectUser({ id: userId, name: userId }, token);
      setClient(chatClient);
      setIsGuest(false);

      // Use persistent session ID so chat history survives refresh for logged-in users
      let sessionId = sessionStorage.getItem('chat_session_id');
      if (!sessionId) {
        sessionId = Date.now().toString();
        sessionStorage.setItem('chat_session_id', sessionId);
      }

      const channelId = `react-chat-${userId}-${sessionId}`;
      const newChannel = chatClient.channel('messaging', channelId, {
        name: 'AI Companion Chat'
      });

      await newChannel.watch();
      setChannel(newChannel);

      // Load existing messages if any
      if (newChannel.state.messages.length > 0) {
        const history = newChannel.state.messages.map(msg => ({
          id: msg.id,
          role: msg.user.id.startsWith('ai-bot') ? 'assistant' : 'user',
          text: msg.text
        }));
        setMessages(history);
      }

      // Start AI agent in background
      axios.post(`${API_BASE_URL}/start-ai-agent`, { channel_id: channelId }, axiosConfig)
           .catch(err => console.error("Error starting AI agent:", err));

      listenToChannel(newChannel);
      setIsInitialized(true);
    };

    const initGuestMode = async () => {
      // Guest: unique ID per session — chat clears on refresh ✅
      const guestId = `guest-${Date.now()}`;

      // For guest mode we need a Stream token — use anonymous/guest token from backend
      const response = await axios.post(`${API_BASE_URL}/token/guest`, { guestId });
      const { token } = response.data;

      chatClient = StreamChat.getInstance(apiKey);
      await chatClient.connectUser({ id: guestId, name: 'Guest' }, token);
      setClient(chatClient);
      setIsGuest(true);

      const channelId = `guest-chat-${guestId}`;
      const newChannel = chatClient.channel('messaging', channelId, {
        name: 'Guest Chat'
      });

      await newChannel.watch();
      setChannel(newChannel);

      // Start AI agent in background
      axios.post(`${API_BASE_URL}/start-ai-agent`, { channel_id: channelId })
           .catch(err => console.error("Error starting AI agent:", err));

      listenToChannel(newChannel);
      setIsInitialized(true);
    };

    const listenToChannel = (ch) => {
      ch.on('message.new', event => {
        if (event.message.text && event.message.text.includes("exceeded your current quota")) return;
        setMessages(prev => {
          if (prev.find(m => m.id === event.message.id)) return prev;
          return [...prev, {
            id: event.message.id,
            role: event.message.user.id.startsWith('ai-bot') ? 'assistant' : 'user',
            text: event.message.text
          }];
        });
      });

      ch.on('message.updated', event => {
        setMessages(prev => prev.map(m =>
          m.id === event.message.id ? { ...m, text: event.message.text } : m
        ));
      });
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text || !channel) return;

    const tempId = `${Date.now()}-user`;
    setMessages(prev => [...prev, { id: tempId, role: "user", text }]);
    inputRef.current.value = "";

    try {
      await channel.sendMessage({ id: tempId, text });
    } catch (err) {
      console.error("Error sending message", err);
    }
  }

  // Show nothing until chat is fully initialized — prevents flash of wrong UI
  if (!isInitialized) {
    return (
      <div style={{ backgroundColor: '#000000', width: '100vw', height: '100dvh' }} />
    );
  }

  return (
    <div className='relative z-0 w-full h-[100dvh] flex justify-center items-center flex-col overflow-hidden' style={{ backgroundColor: '#000000' }}>
      <Header
        isGuest={isGuest}
        onLoginClick={() => setShowLoginModal(true)}
      />
      {messages.length > 0
        ? <Chatsection messages={messages} />
        : <Open inputRef={inputRef} username={client?.user?.id} isGuest={isGuest} onLoginClick={() => setShowLoginModal(true)} />
      }
      <Input inputRef={inputRef} handleSubmit={handleSubmit} />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          apiBaseUrl={API_BASE_URL}
        />
      )}
    </div>
  )
}

export default Chat
