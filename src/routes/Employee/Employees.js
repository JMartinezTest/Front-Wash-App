import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { apiService } from '../../api/apiService';
import DataTable from '../../components/DataTable';
import PageState from '../../components/PageState';
import { useDatosActualizados } from '../../hooks/datosDelNegocio';
import { AltaEmpleado } from '../../components/AltaRapida';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [creando, setCreando] = useState(false);

  const fetchEmployees = async () => {
    try {
      const data = await apiService.getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los empleados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  // El asistente puede cambiar estos datos desde su panel flotante.
  useDatosActualizados(fetchEmployees);

  const handleDelete = async ({ id, name, lastName }) => {
    if (!window.confirm(`¿Eliminar a ${name} ${lastName}?`)) return;
    try {
      await apiService.deleteEmployee(id);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el empleado.');
    } finally {
      fetchEmployees();
    }
  };

  const columns = [
    { key: 'name', title: 'Nombre',
      search: (e) => `${e.name} ${e.lastName}`,
      render: (e) => `${e.name} ${e.lastName}` },
    { key: 'position', title: 'Cargo', render: (e) => e.position || '—' },
    { key: 'phoneNumber', title: 'Teléfono', render: (e) => e.phoneNumber || '—' },
  ];

  if (loading) return <PageState titulo="Empleados" cargando />;

  return (
    <>
      <div className="page-header">
        <div className="page-header__titles">
          <h1>Empleados</h1>
          <p className="page-header__subtitle">
            {employees.length} {employees.length === 1 ? 'empleado' : 'empleados'} · comisión del 35%
          </p>
        </div>
        <div className="page-header__actions">
          <button className="btn btn--primary" onClick={() => setCreando(true)}>
            <FaPlus /> Nuevo empleado
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <DataTable
        searchPlaceholder="Buscar por nombre o cargo…"
        itemLabel="empleados"
        pageSize={10}
        columns={columns}
        data={employees}
        onDelete={handleDelete}
        onEdit={(e) => navigate(`/employees/edit/${e.id}`)}
        emptyMessage="Todavía no hay empleados"
        emptyHint="Registra a tu equipo para poder asignarles lavados y calcular sus comisiones."
        emptyAction={
          <button className="btn btn--primary" onClick={() => setCreando(true)}>
            <FaPlus /> Nuevo empleado
          </button>
        }
      />

      {creando && (
        <AltaEmpleado
          onCreado={(nuevo) => { setEmployees((prev) => [...prev, nuevo]); setCreando(false); }}
          onCerrar={() => setCreando(false)}
        />
      )}
    </>
  );
};

export default Employees;
