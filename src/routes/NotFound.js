import React from "react";
import { Link } from "react-router-dom";
import { FaCompass } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="card">
      <div className="state">
        <span className="state__icon"><FaCompass /></span>
        <p className="state__title">Esta página no existe</p>
        <p className="state__text">
          Puede que el enlace esté mal escrito o que la sección se haya movido.
        </p>
        <Link to="/inicio" className="btn btn--primary">Volver al inicio</Link>
      </div>
    </div>
  );
}
