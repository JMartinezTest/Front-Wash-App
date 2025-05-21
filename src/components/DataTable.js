import React from 'react';
import './DataTable.css';

const DataTable = ({ 
  columns = [], 
  data = [], 
  emptyMessage = 'No hay datos disponibles',
  onDelete,
  onEdit
}) => {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {Array.isArray(columns) && columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
            {(onDelete || onEdit) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id || item.licencePlate}>
                {columns.map((column) => (
                  <td key={`${item.id || item.licencePlate}-${column.key}`}>
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                {(onDelete || onEdit) && (
                  <td className="actions-cell">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(item)}
                        className="edit-button"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(item)}
                        className="delete-button"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + ((onDelete || onEdit) ? 1 : 0)}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
