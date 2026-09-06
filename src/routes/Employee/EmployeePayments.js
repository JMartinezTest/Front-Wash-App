import React, { useState, useEffect } from "react";
import { apiService } from "../../api/apiService";
import DataTable from "../../components/DataTable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PageState from "../../components/PageState";
import { dinero, fechaCorta, fechaHora } from "../../utils/formato";
import "./EmployeePayments.css";

const EmployeePayments = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [calculatedPayment, setCalculatedPayment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [startDate, endDate] = dateRange;

  const fetchHistory = async () => {
    try {
      const data = await apiService.getPaymentRecords();
      setHistory(data || []);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    Promise.all([apiService.getEmployees(), apiService.getPaymentRecords()])
      .then(([emp, hist]) => {
        setEmployees(emp || []);
        setHistory(hist || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar datos: " + err.message);
        setLoading(false);
      });
  }, []);

  const handleDateRangeChange = (update) => {
    if (update[0] && update[1]) setDateRange(update);
  };

  const calculatePayments = async () => {
    if (!selectedEmployee) return;
    setCalculating(true);
    setError("");
    setSuccess("");
    setCalculatedPayment(null);

    try {
      const adjustedStart = new Date(startDate);
      adjustedStart.setHours(0, 0, 0, 0);
      const adjustedEnd = new Date(endDate);
      adjustedEnd.setHours(23, 59, 59, 999);

      const total = await apiService.calculateEmployeePayment(
        selectedEmployee, adjustedStart, adjustedEnd
      );

      const employee = employees.find((e) => e.id === selectedEmployee);
      setCalculatedPayment({
        employeeId: selectedEmployee,
        employeeName: employee ? `${employee.name} ${employee.lastName}` : selectedEmployee,
        startDate: adjustedStart,
        endDate: adjustedEnd,
        totalPayment: typeof total === "number" ? total : 0,
      });
    } catch (err) {
      setError("Error al calcular: " + (err.message || "Intenta de nuevo"));
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!calculatedPayment) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiService.savePaymentRecord(calculatedPayment);
      setSuccess("✅ Pago guardado correctamente");
      setCalculatedPayment(null);
      await fetchHistory();
    } catch (err) {
      setError("Error al guardar: " + (err.message || "Intenta de nuevo"));
    } finally {
      setSaving(false);
    }
  };

  const historyColumns = [
    { key: "employeeName", title: "Empleado" },
    {
      key: "period",
      title: "Periodo",
      search: (r) => `${fechaCorta(r.startDate)} ${fechaCorta(r.endDate)}`,
      render: (r) => `${fechaCorta(r.startDate)} — ${fechaCorta(r.endDate)}`,
    },
    {
      key: "totalPayment",
      title: "Total pagado",
      numeric: true,
      render: (r) => dinero(r.totalPayment),
    },
    { key: "calculatedAt", title: "Registrado", render: (r) => fechaHora(r.calculatedAt) },
  ];

  if (loading) return <PageState titulo="Pagos a empleados" cargando />;

  return (
    <>
      <div className="page-header">
        <div className="page-header__titles">
          <h1>Pagos a empleados</h1>
          <p className="page-header__subtitle">
            Calcula la comisión del 35% sobre los servicios realizados en un periodo.
          </p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <div className="pagos-columnas">
        <section className="card">
          <div className="card__header"><h2>Calcular comisión</h2></div>
          <div className="card__body">
            <div className="form-grid">
              <div className="field field--full">
                <label htmlFor="empleado">Empleado</label>
                <select
                  id="empleado"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Seleccionar empleado</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} {e.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Desde</label>
                <DatePicker
                  selected={startDate}
                  onChange={(d) => handleDateRangeChange([d, endDate])}
                  selectsStart startDate={startDate} endDate={endDate}
                  maxDate={new Date()} dateFormat="dd/MM/yyyy"
                />
              </div>

              <div className="field">
                <label>Hasta</label>
                <DatePicker
                  selected={endDate}
                  onChange={(d) => handleDateRangeChange([startDate, d])}
                  selectsEnd startDate={startDate} endDate={endDate}
                  minDate={startDate} maxDate={new Date()} dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn--primary"
                onClick={calculatePayments}
                disabled={!selectedEmployee || calculating}
              >
                {calculating ? "Calculando…" : "Calcular comisión"}
              </button>
            </div>
          </div>
        </section>

        <section className="card resultado-pago">
          <div className="card__header"><h2>Resultado</h2></div>
          <div className="card__body">
            {!calculatedPayment ? (
              <p className="resumen__vacio">
                Elige un empleado y un periodo para ver cuánto le corresponde.
              </p>
            ) : (
              <>
                <p className="resultado-pago__empleado">{calculatedPayment.employeeName}</p>
                <p className="resultado-pago__periodo">
                  {fechaCorta(calculatedPayment.startDate)} — {fechaCorta(calculatedPayment.endDate)}
                </p>
                <div className="resultado-pago__cifra">
                  <span>Comisión (35%)</span>
                  <strong>{dinero(calculatedPayment.totalPayment)}</strong>
                </div>
                <button
                  className="btn btn--primary btn--block"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Guardando…" : "Guardar pago"}
                </button>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="page-header pagos-historial-cabecera">
        <div className="page-header__titles">
          <h2>Pagos guardados</h2>
        </div>
      </div>

      <DataTable
        searchPlaceholder="Buscar por empleado…"
        itemLabel="pagos"
        pageSize={10}
        columns={historyColumns}
        data={history}
        emptyMessage="Todavía no hay pagos guardados"
        emptyHint="Cuando calcules y guardes una comisión aparecerá en este historial."
      />
    </>
  );
};

export default EmployeePayments;
