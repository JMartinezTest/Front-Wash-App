import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import './Modal.css';

/** Ventana emergente para tareas cortas sin abandonar la pantalla actual. */
const Modal = ({ titulo, subtitulo, onCerrar, children }) => {
  // Escape cierra, y se bloquea el desplazamiento del fondo mientras esta abierta.
  useEffect(() => {
    const alTeclear = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', alTeclear);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onCerrar]);

  return (
    <div className="modal-velo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal__cabecera">
          <div>
            <h2 className="modal__titulo">{titulo}</h2>
            {subtitulo && <p className="modal__subtitulo">{subtitulo}</p>}
          </div>
          <button type="button" className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">
            <FaTimes />
          </button>
        </div>
        <div className="modal__cuerpo">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
