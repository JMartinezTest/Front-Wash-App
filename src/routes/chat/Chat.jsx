import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiService } from '../../api/apiService';
import './Chat.css';

// El backend devuelve los nombres de las herramientas que ejecuto; aqui se traducen
// a algo que el usuario pueda leer debajo de la respuesta.
const ETIQUETAS_DE_ACCION = {
  listar_servicios: 'Consultó los servicios',
  buscar_clientes: 'Buscó en clientes',
  buscar_vehiculos: 'Buscó en vehículos',
  listar_empleados: 'Consultó los empleados',
  consultar_lavados: 'Consultó el historial de lavados',
  calcular_comision_empleado: 'Calculó una comisión',
  resumen_del_negocio: 'Consultó el resumen del negocio',
  registrar_cliente: 'Registró un cliente',
  registrar_vehiculo: 'Registró un vehículo',
  registrar_empleado: 'Registró un empleado',
  registrar_lavado: 'Registró un lavado',
};

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy el asistente de San Felipe. ¿En qué te ayudo?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      // Se manda la conversacion previa para que el asistente mantenga el contexto.
      const history = messages
        .filter((msg) => !msg.text.startsWith('⚠️'))
        .map(({ role, text: content }) => ({ role, text: content }));

      const data = await apiService.sendChatMessage(text, history);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.response, actions: data.actions || [] },
      ]);
    } catch (err) {
      let errorMsg = 'Lo siento, ocurrió un error al conectar con el asistente.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error) errorMsg = parsed.error;
      } catch {
        if (err.message) errorMsg = err.message;
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: '⚠️ ' + errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-popup">
          <div className="chat-popup-header">
            <div className="chat-popup-title">
              <div className="chat-avatar-sm">SF</div>
              <div>
                <p className="chat-popup-name">Asistente San Felipe</p>
                <span className="chat-popup-status">● En línea</span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-popup-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                {msg.role === 'assistant' && <div className="chat-avatar-xs">SF</div>}
                <div className="chat-msg-content">
                  <div className="chat-msg-bubble">
                    {msg.role === 'assistant' ? (
                      <div className="markdown">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Las tablas pueden ser mas anchas que el widget.
                            table: ({ node, ...props }) => (
                              <div className="markdown__tabla"><table {...props} /></div>
                            ),
                            // Cualquier enlace que sugiera el modelo se abre aparte.
                            a: ({ node, ...props }) => (
                              <a {...props} target="_blank" rel="noopener noreferrer" />
                            ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.actions?.length > 0 && (
                    <ul className="chat-msg-actions">
                      {msg.actions.map((accion, j) => (
                        <li key={j}>{ETIQUETAS_DE_ACCION[accion] || accion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg assistant">
                <div className="chat-avatar-xs">SF</div>
                <div className="chat-msg-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-popup-input" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}

      <button className="chat-fab" onClick={() => setOpen((prev) => !prev)} title="Asistente IA">
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default Chat;
