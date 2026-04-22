import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../../api/apiService';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '¡Hola! Soy el asistente virtual de San Felipe. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const data = await apiService.sendChatMessage(text);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Lo siento, ocurrió un error. Inténtalo de nuevo.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-icon">💬</div>
        <div>
          <h2>Asistente San Felipe</h2>
          <span className="chat-status">Powered by Gemini</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="bubble-avatar">SF</div>
            )}
            <div className="bubble-text">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant">
            <div className="bubble-avatar">SF</div>
            <div className="bubble-text typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default Chat;
