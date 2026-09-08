import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { apiService } from '../../api/apiService';
import DataTable from '../../components/DataTable';
import PageState from '../../components/PageState';
import { useDatosActualizados } from '../../hooks/datosDelNegocio';
import { AltaServicio } from '../../components/AltaRapida';
import { dinero } from '../../utils/formato';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [creando, setCreando] = useState(false);

  const fetchServices = async () => {
    try {
      const data = await apiService.getServices();
      setServices(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los servicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  // El asistente puede cambiar estos datos desde su panel flotante.
  useDatosActualizados(fetchServices);

  const handleDelete = async ({ id, name }) => {
    if (!window.confirm(`¿Eliminar el servicio "${name}"?`)) return;
    try {
      await apiService.deleteService(id);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el servicio.');
    } finally {
      fetchServices();
    }
  };

  const columns = [
    { key: 'name', title: 'Servicio', render: (s) => <strong>{s.name}</strong> },
    { key: 'description', title: 'Descripción', render: (s) => s.description || '—' },
    { key: 'duration', title: 'Duración', render: (s) => s.duration || '—' },
    {
      key: 'price',
      title: 'Precio',
      numeric: true,
      render: (s) => dinero(s.price),
    },
  ];

  if (loading) return <PageState titulo="Servicios" cargando />;

  return (
    <>
      <div className="page-header">
        <div className="page-header__titles">
          <h1>Servicios</h1>
          <p className="page-header__subtitle">
            {services.length} {services.length === 1 ? 'servicio ofrecido' : 'servicios ofrecidos'}
          </p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setCreando(true)}>
            <FaPlus /> Nuevo servicio
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <DataTable
        searchPlaceholder="Buscar servicio…"
        itemLabel="servicios"
        pageSize={10}
        columns={columns}
        data={services}
        onDelete={handleDelete}
        onEdit={(s) => navigate(`/services/edit/${s.id}`)}
        emptyMessage="Todavía no hay servicios"
        emptyHint="Define los servicios del lavadero con su precio y duración."
        emptyAction={
          <button className="btn btn--primary" onClick={() => setCreando(true)}>
            <FaPlus /> Nuevo servicio
          </button>
        }
      />

      {creando && (
        <AltaServicio
          onCreado={(nuevo) => { setServices((prev) => [...prev, nuevo]); setCreando(false); }}
          onCerrar={() => setCreando(false)}
        />
      )}
    </>
  );
};

export default Services;
