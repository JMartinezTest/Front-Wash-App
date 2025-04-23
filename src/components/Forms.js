import React from 'react';
import './Form.css';

const Form = ({ 
  title, 
  fields, 
  onSubmit, 
  error, 
  successMessage,
  submitText = 'Guardar'
}) => {
  return (
    <div className="form-container">
      <h3>{title}</h3>
      {error && <div className="form-error">{error}</div>}
      {successMessage && <div className="form-success">{successMessage}</div>}

      <form onSubmit={onSubmit}>
        {fields.map((field) => (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              type={field.type || 'text'}
               name={field.name} 
              placeholder={field.placeholder}
              value={field.value}
              onChange={field.onChange}
              required={field.required !== false}
            />
          </div>
        ))}
        <button type="submit" className="form-submit-button">
          {submitText}
        </button>
      </form>
    </div>
  );
};

export default Form;