import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import Form from '../../components/Forms';  
const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    nit: '',
    phoneNumber: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar datos iniciales si es edición
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const clientData = await apiService.getClient(id);
          setFormData(clientData);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (id) {
        await apiService.updateClient(id, formData);
        setSuccessMessage('Cliente actualizado correctamente');
      } else {
        await apiService.registerClient(formData);
        setSuccessMessage('Cliente registrado correctamente');
        setFormData({
          name: '',
          lastName: '',
          nit: '',
          phoneNumber: '',
          email: '',
          address: ''
        });
      }
      
      setTimeout(() => navigate('/clients'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fields = [
    { name: 'name', label: 'Nombre', value: formData.name, onChange: handleChange, required: true },
    { name: 'lastName', label: 'Apellido', value: formData.lastName, onChange: handleChange, required: true },
    { name: 'nit', label: 'NIT', value: formData.nit, onChange: handleChange,
      hint: 'Documento o NIT para la facturación.' },
    { name: 'phoneNumber', label: 'Teléfono', type: 'tel', value: formData.phoneNumber, onChange: handleChange },
  ];

  if (loading) {
    return (
      <div className="card">
        <div className="state"><span className="spinner" /><p className="state__text">Cargando cliente…</p></div>
      </div>
    );
  }

  return (
    <Form
      title={id ? 'Editar cliente' : 'Nuevo cliente'}
      subtitle="Los clientes se asocian a los lavados que registres."
      fields={fields}
      onSubmit={handleSubmit}
      error={error}
      successMessage={successMessage}
      submitText={id ? 'Guardar cambios' : 'Registrar cliente'}
      cancelTo="/clients"
    />
  );
};

export default ClientForm;