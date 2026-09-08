import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { apiService } from '../../api/apiService';
import DataTable from '../../components/DataTable';
import PageState from '../../components/PageState';
import { useDatosActualizados } from '../../hooks/datosDelNegocio';
import { AltaCliente } from '../../components/AltaRapida';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [creando, setCreando] = useState(false);

  const fetchClients = async () => {
    try {
      const data = await apiService.getClients();
      setClients(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  // El asistente puede cambiar estos datos desde su panel flotante.
  useDatosActualizados(fetchClients);

  const handleDelete = async ({ id, name, lastName }) => {
    if (!window.confirm(`¿Eliminar a ${name} ${lastName}?`)) return;
    try {
      await apiService.deleteClient(id);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el cliente.');
    } finally {
      fetchClients();
    }
  };

  const columns = [
    { key: 'name', title: 'Nombre',
      search: (c) => `${c.name} ${c.lastName}`,
      render: (c) => `${c.name} ${c.lastName}` },
    { key: 'nit', title: 'NIT', render: (c) => c.nit || '—' },
    { key: 'phoneNumber', title: 'Teléfono', render: (c) => c.phoneNumber || '—' },
  ];

  if (loading) return <PageState titulo="Clientes" cargando />;

  return (
    <>
      <div className="page-header">
        <div className="page-header__titles">
          <h1>Clientes</h1>
          <p className="page-header__subtitle">
            {clients.length} {clients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
          </p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setCreando(true)}>
            <FaPlus /> Nuevo cliente
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <DataTable
        searchPlaceholder="Buscar por nombre, apellido o NIT…"
        itemLabel="clientes"
        pageSize={10}
        columns={columns}
        data={clients}
        onDelete={handleDelete}
        onEdit={(c) => navigate(`/clients/edit/${c.id}`)}
        emptyMessage="Todavía no hay clientes"
        emptyHint="Registra tu primer cliente para poder asociarlo a los lavados."
        emptyAction={
          <button className="btn btn--primary" onClick={() => setCreando(true)}>
            <FaPlus /> Nuevo cliente
          </button>
        }
      />

      {creando && (
        <AltaCliente
          onCreado={(nuevo) => { setClients((prev) => [...prev, nuevo]); setCreando(false); }}
          onCerrar={() => setCreando(false)}
        />
      )}
    </>
  );
};

export default Clients;
