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
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return [startDate, endDate];
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    apiService.getEmployees()
      .then((data) => { setEmployees(data); setLoading(false); })
      .catch((err) => { setError("Error al cargar empleados: " + err.message); setLoading(false); });
  }, []);

  const calculatePayments = async () => {
    if (!selectedEmployee) return;
    setCalculating(true);
    setError("");
    setPayments([]);

    try {
      const adjustedStart = new Date(startDate);
      adjustedStart.setHours(0, 0, 0, 0);
      const adjustedEnd = new Date(endDate);
      adjustedEnd.setHours(23, 59, 59, 999);

      const paymentsData = await apiService.calculateEmployeePayment(
        selectedEmployee,
        adjustedStart,
        adjustedEnd
      );

      const employee = employees.find((e) => e.id === selectedEmployee);
      setPayments([
        {
          id: 1,
          employee: employee ? `${employee.name} ${employee.lastName}` : selectedEmployee,
          period: `${adjustedStart.toLocaleDateString()} - ${adjustedEnd.toLocaleDateString()}`,
          total: typeof paymentsData === "number" ? paymentsData : 0,
          details: `Calculado el ${new Date().toLocaleDateString()}`,
        },
      ]);
    } catch (err) {
      setError("Error al calcular el pago: " + (err.message || "Intenta de nuevo"));
    } finally {
      setCalculating(false);
    }
  };

  const handleDateRangeChange = (update) => {
    if (update[0] && update[1]) setDateRange(update);
  };

  const columns = [
    { key: "employee", title: "Empleado" },
    { key: "period", title: "Periodo" },
    {
      key: "total",
      title: "Total a Pagar (35%)",
      render: (payment) => `$${Number(payment.total).toFixed(2)}`,
    },
    { key: "details", title: "Detalles" },
  ];

  if (loading) return <div>Cargando datos...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Cálculo de Pagos a Empleados</h2>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>
          ⚠️ {error}
        </div>
      )}

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

        <div className="form-dates">
          <div>
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
          <div>
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
          <div className="calc-button">
            <button onClick={calculatePayments} disabled={!selectedEmployee || calculating}>
              {calculating ? "Calculando..." : "Calcular Pago"}
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        emptyMessage="Seleccione un empleado y un rango de fechas, luego presione Calcular Pago"
      />
    </div>
  );
};

export default EmployeePayments;
