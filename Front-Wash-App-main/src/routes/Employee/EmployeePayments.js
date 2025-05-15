import React, { useState, useEffect } from "react";
import { apiService } from "../../api/apiService";
import DataTable from "../../components/DataTable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./EmployeePayments.css";

const EmployeePayments = () => {
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Función para obtener el rango de fechas por defecto (1 mes atrás hasta hoy)
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    // Ajustar fechas para cubrir todo el día
    startDate.setMonth(endDate.getMonth() - 1);
    startDate.setHours(0, 0, 0, 0); // Inicio del día
    endDate.setHours(23, 59, 59, 999); // Final del día

    return [startDate, endDate];
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [startDate, endDate] = dateRange;

  const fetchData = async () => {
    try {
      const [employeesData] = await Promise.all([apiService.getEmployees()]);
      setEmployees(employeesData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const calculatePayments = async () => {
    try {
      if (!selectedEmployee) return;

      // Asegurar que las fechas cubran todo el día
      const adjustedStart = new Date(startDate);
      adjustedStart.setHours(0, 0, 0, 0);

      const adjustedEnd = new Date(endDate);
      adjustedEnd.setHours(23, 59, 59, 999);

      const paymentsData = await apiService.calculateEmployeePayment(
        selectedEmployee,
        adjustedStart,
        adjustedEnd
      );

      setPayments([
        {
          id: 1,
          employee:
            employees.find((e) => e.id === selectedEmployee)?.name ||
            selectedEmployee,
          period: `${adjustedStart.toLocaleDateString()} - ${adjustedEnd.toLocaleDateString()}`,
          total: paymentsData,
          details: `Pago calculado al ${new Date().toLocaleDateString()}`,
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateRangeChange = (update) => {
    if (update[0] && update[1]) {
      setDateRange(update);
    }
  };

  const columns = [
    { key: "employee", title: "Empleado" },
    { key: "period", title: "Periodo" },
    {
      key: "total",
      title: "Total a Pagar",
      render: (payment) => `$${payment.total.toFixed(2)}`,
    },
    { key: "details", title: "Detalles" },
  ];

  if (loading) return <div>Cargando datos...</div>;

  return (
    <div className="page-container">
      <div>
        <div className="page-header">
          <h2>Cálculo de Pagos a Empleados</h2>
        </div>

        <div className="date-range-info">
          <p>
            <strong>Periodo seleccionado:</strong>{" "}
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
          <p>
            <small>
              Duración:{" "}
              {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} días
            </small>
          </p>
        </div>
        <div className="payment-controls">
          <div className="form-group">
            <label>Empleado:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Seleccionar empleado</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} {employee.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fecha Inicio:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => handleDateRangeChange([date, endDate])}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
            />
          </div>

          <div className="form-group">
            <label>Fecha Fin:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => handleDateRangeChange([startDate, date])}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
            />
          </div>
          <div className="form-button">
            <button onClick={calculatePayments} disabled={!selectedEmployee}>
              Calcular Pago
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        emptyMessage="Seleccione un empleado y fechas para calcular el pago"
      />
    </div>
  );
};

export default EmployeePayments;
