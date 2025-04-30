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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState("");

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

      const paymentsData = await apiService.calculateEmployeePayment(
        selectedEmployee,
        startDate,
        endDate
      );

      setPayments([
        {
          id: 1,
          employee:
            employees.find((e) => e.id === selectedEmployee)?.name ||
            selectedEmployee,
          period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
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
      <div className="page-header">
        <h2>Cálculo de Pagos a Empleados</h2>
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
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        <div className="form-group">
          <label>Fecha Fin:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />
        </div>

        <button onClick={calculatePayments} disabled={!selectedEmployee}>
          Calcular Pago
        </button>
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
