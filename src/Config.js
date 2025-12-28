
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const url_backend = isLocal
  ? "http://127.0.0.1:8000"
  : "https://tesis-cawe.onrender.com";