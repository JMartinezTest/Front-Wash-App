import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { apiService } from '../../api/apiService';
import DataTable from '../../components/DataTable';
import PageState from '../../components/PageState';
import { AltaVehiculo } from '../../components/AltaRapida';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [creando, setCreando] = useState(false);

  const fetchCars = async () => {
    try {
      const [data, clientesData] = await Promise.all([
        apiService.getCars(),
        apiService.getClients(),
      ]);
      setCars(Array.isArray(data) ? data : []);
      setClients(Array.isArray(clientesData) ? clientesData : []);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los vehículos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, []);

  const handleDelete = async ({ id, licencePlate }) => {
    if (!window.confirm(`¿Eliminar el vehículo con placa ${licencePlate}?`)) return;
    try {
      await apiService.deleteCar(id);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el vehículo.');
    } finally {
      fetchCars();
    }
  };

  const nombreCliente = (id) => {
    const c = clients.find((x) => x.id === id);
    return c ? `${c.name} ${c.lastName}` : null;
  };

  const columns = [
    { key: 'licencePlate', title: 'Placa', render: (c) => <span className="badge">{c.licencePlate}</span> },
    { key: 'make', title: 'Marca' },
    { key: 'color', title: 'Color', render: (c) => c.color || '—' },
    {
      key: 'clientId',
      title: 'Propietario',
      search: (c) => nombreCliente(c.clientId) || '',
      render: (c) => nombreCliente(c.clientId)
        || <span className="dato-ausente">sin asignar</span>,
    },
  ];

  if (loading) return <PageState titulo="Vehículos" cargando />;

  return (
    <>
      <div className="page-header">
        <div className="page-header__titles">
          <h1>Vehículos</h1>
          <p className="page-header__subtitle">
            {cars.length} {cars.length === 1 ? 'vehículo registrado' : 'vehículos registrados'}
          </p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setCreando(true)}>
            <FaPlus /> Nuevo vehículo
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <DataTable
        searchPlaceholder="Buscar por placa, marca o propietario…"
        itemLabel="vehículos"
        pageSize={10}
        columns={columns}
        data={cars}
        onDelete={handleDelete}
        onEdit={(c) => navigate(`/cars/edit/${c.licencePlate}`)}
        emptyMessage="Todavía no hay vehículos"
        emptyHint="Registra un vehículo para poder asociarlo a los lavados."
        emptyAction={
          <button className="btn btn--primary" onClick={() => setCreando(true)}>
            <FaPlus /> Nuevo vehículo
          </button>
        }
      />

      {creando && (
        <AltaVehiculo
          onCreado={(nuevo) => { setCars((prev) => [...prev, nuevo]); setCreando(false); }}
          onCerrar={() => setCreando(false)}
        />
      )}
    </>
  );
};

export default Cars;
