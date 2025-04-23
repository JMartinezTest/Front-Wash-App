import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import DataTable from '../../components/DataTable';

const WashHistory = () => {
  const [washes, setWashes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWashes = async () => {
    try {
      const data = await apiService.getWashedRecords();
      setWashes(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWashes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro de lavado?')) {
      try {
        await apiService.deleteWashedRecord(id);
        fetchWashes(); // Recargar la lista
      } catch (err) {
        console.error(err);
      }
    }
  };

  const columns = [
    { key: 'date', title: 'Fecha' },
    { key: 'clientName', title: 'Cliente' },
    { key: 'carDetails', title: 'Vehículo' },
    { key: 'serviceType', title: 'Servicio' },
    { key: 'employeeName', title: 'Empleado' },
    { key: 'total', title: 'Total', render: (wash) => `$${wash.total}` },
    { 
      key: 'actions',
      title: 'Acciones',
      render: (wash) => (
        <div className="actions">
          <button onClick={() => navigate(`/washes/edit/${wash.id}`)}>
            Editar
          </button>
          <button onClick={() => handleDelete(wash.id)}>
            Eliminar
          </button>
        </div>
      )
    }
  ];

  if (loading) return <div>Cargando historial de lavados...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Historial de Lavados</h2>
        <button onClick={() => navigate('/washes/new')}>
          + Nuevo Lavado
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={washes} 
        emptyMessage="No hay registros de lavados"
      />
    </div>
  );
};

export default WashHistory;