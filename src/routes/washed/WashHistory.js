import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { apiService } from '../../api/apiService';
import DataTable from '../../components/DataTable';
import PageState from '../../components/PageState';
import { useDatosActualizados } from '../../hooks/datosDelNegocio';
import { dinero, fechaCorta } from '../../utils/formato';

const WashHistory = () => {
  const [washes, setWashes] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cars, setCars] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      const [washesData, servicesData, employeesData, carsData, clientsData] = await Promise.all([
        apiService.getWashedRecords(),
        apiService.getServices(),
        apiService.getEmployees(),
        apiService.getCars(),
        apiService.getClients(),
      ]);
      // Lo más reciente primero: es lo que se consulta a diario.
      setWashes([...(washesData || [])].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setServices(servicesData || []);
      setEmployees(employeesData || []);
      setCars(carsData || []);
      setClients(clientsData || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error cargando datos. Verifica que el backend esté disponible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // El asistente puede cambiar estos datos desde su panel flotante.
  useDatosActualizados(fetchAllData);

  const nombreServicio = (id) => services.find((s) => s.id === id)?.name;
  const nombreEmpleado = (id) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.name} ${e.lastName}` : null;
  };
  const nombreCliente = (id) => {
    const c = clients.find((x) => x.id === id);
    return c ? `${c.name} ${c.lastName}` : null;
  };
  const vehiculo = (id) => {
    const c = cars.find((x) => x.id === id);
    return c ? { placa: c.licencePlate, detalle: `${c.make} ${c.color || ''}`.trim() } : null;
  };

  // Un registro puede apuntar a algo ya borrado; se marca en vez de mentir.
  const ausente = (texto) => <span className="dato-ausente">{texto}</span>;

  const handleDelete = async ({ id }) => {
    if (!window.confirm('¿Eliminar este registro de lavado?')) return;
    try {
      await apiService.deleteWashedRecord(id);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el registro.');
    } finally {
      fetchAllData();
    }
  };

  const columns = [
    {
      key: 'date',
      title: 'Fecha',
      search: (w) => fechaCorta(w.date) || '',
      render: (w) => fechaCorta(w.date) || ausente('sin fecha'),
    },
    {
      key: 'client',
      title: 'Cliente',
      search: (w) => nombreCliente(w.client) || '',
      render: (w) => nombreCliente(w.client) || ausente('cliente eliminado'),
    },
    {
      key: 'car',
      title: 'Vehículo',
      search: (w) => {
        const v = vehiculo(w.car);
        return v ? `${v.placa} ${v.detalle}` : '';
      },
      render: (w) => {
        const v = vehiculo(w.car);
        if (!v) return ausente('vehículo eliminado');
        return (
          <div className="celda-vehiculo">
            <span className="badge">{v.placa}</span>
            <span className="celda-vehiculo__detalle">{v.detalle}</span>
          </div>
        );
      },
    },
    {
      key: 'serviceOffered',
      title: 'Servicios',
      search: (w) => (w.serviceOffered || []).map((id) => nombreServicio(id) || '').join(' '),
      render: (w) => (
        <div className="celda-servicios">
          {(w.serviceOffered || []).map((id) => (
            <span key={id} className="badge badge--neutral">
              {nombreServicio(id) || 'servicio eliminado'}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'employee',
      title: 'Empleado',
      search: (w) => nombreEmpleado(w.employee) || '',
      render: (w) => nombreEmpleado(w.employee) || ausente('empleado eliminado'),
    },
    {
      key: 'clima',
      title: 'Clima',
      search: (w) => w.clima || '',
      render: (w) => (w.clima
        ? <span className="clima-celda">{w.clima}<span className="clima-celda__temp">{Math.round(w.temperatura)}°</span></span>
        : <span className="dato-ausente">—</span>),
    },
    {
      key: 'total',
      title: 'Total',
      numeric: true,
      render: (w) => dinero(w.total),
    },
  ];

  if (loading) return <PageState titulo="Historial de lavados" cargando />;

  const facturado = washes.reduce((a, w) => a + (w.total || 0), 0);

  return (
    <>
      <div className="page-header">
        <div className="page-header__titles">
          <h1>Historial de lavados</h1>
          <p className="page-header__subtitle">
            {washes.length} {washes.length === 1 ? 'registro' : 'registros'} · {dinero(facturado)} facturados
          </p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => navigate('/washes/new')}>
            <FaPlus /> Nuevo lavado
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <DataTable
        searchPlaceholder="Buscar cliente, placa o empleado…"
        itemLabel="lavados"
        pageSize={10}
        columns={columns}
        data={washes}
        onDelete={handleDelete}
        onEdit={(w) => navigate(`/washes/edit/${w.id}`)}
        emptyMessage="Todavía no hay lavados"
        emptyHint="Registra el primer lavado para empezar a llevar el historial y las comisiones."
        emptyAction={
          <button className="btn btn--primary" onClick={() => navigate('/washes/new')}>
            <FaPlus /> Registrar lavado
          </button>
        }
      />
    </>
  );
};

export default WashHistory;
