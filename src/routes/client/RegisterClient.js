import React, { useState } from 'react';


function RegisterClient() {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
  };

  return (
    <div className="container">
      <h2>Registrar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nombre del cliente" 
          value={clientName} 
          onChange={(e) => setClientName(e.target.value)} 
        />
        <input 
          type="tel" 
          placeholder="Teléfono" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
        />
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default RegisterClient;
