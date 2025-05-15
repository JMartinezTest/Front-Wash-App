import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import Form from '../../components/Forms';
import './Payment.css';

const Payment = () => {
  const { washId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    washId: washId || '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    amount: 0,
    reference: '',
    notes: ''
  });
  const [washes, setWashes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar lavados disponibles si no se proporciona washId
  useEffect(() => {
    const fetchData = async () => {
      if (!washId) {
        setLoading(true);
        try {
          const washesData = await apiService.getWashedRecords();
          setWashes(washesData);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [washId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await apiService.registerPayment(formData);
      setSuccessMessage('Pago registrado correctamente');
      
      setTimeout(() => navigate('/payments'), 2000);
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

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const fields = [
    !washId && {
      name: 'washId',
      label: 'Lavado',
      type: 'select',
      value: formData.washId,
      onChange: handleChange,
      options: washes.map(wash => ({
        value: wash.id,
        label: `Lavado #${wash.id} - ${wash.clientName} ($${wash.total})`
      })),
      required: true
    },
    {
      name: 'paymentDate',
      label: 'Fecha de Pago',
      type: 'date',
      value: formData.paymentDate,
      onChange: handleChange,
      required: true
    },
    {
      name: 'paymentMethod',
      label: 'Método de Pago',
      type: 'select',
      value: formData.paymentMethod,
      onChange: handleChange,
      options: [
        { value: 'cash', label: 'Efectivo' },
        { value: 'credit_card', label: 'Tarjeta de Crédito' },
        { value: 'debit_card', label: 'Tarjeta de Débito' },
        { value: 'transfer', label: 'Transferencia Bancaria' }
      ],
      required: true
    },
    {
      name: 'amount',
      label: 'Monto',
      type: 'number',
      value: formData.amount,
      onChange: handleNumberChange,
      required: true,
      step: "0.01"
    },
    {
      name: 'reference',
      label: 'Referencia/Número',
      type: 'text',
      value: formData.reference,
      onChange: handleChange,
      required: formData.paymentMethod !== 'cash'
    },
    {
      name: 'notes',
      label: 'Notas',
      type: 'textarea',
      value: formData.notes,
      onChange: handleChange
    }
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h2>Registrar Pago</h2>
      
      <Form
        fields={fields}
        onSubmit={handleSubmit}
        error={error}
        successMessage={successMessage}
        submitText="Registrar Pago"
      />
    </div>
  );
};

export default Payment;