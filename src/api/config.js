// URL base del backend. Se configura con PUBLIC_API_BASE_URL en el archivo .env
// (ver .env.example). Si no se define, se usa el backend de produccion.
export const API_BASE_URL =
  process.env.PUBLIC_API_BASE_URL || "https://backwashapp-production.up.railway.app";
