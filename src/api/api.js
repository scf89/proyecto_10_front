import { showSpinner, hideSpinner } from "../components/Spinner/Spinner";

export const apiFetch = async (endpoint, method = "GET", data = null, token = null, content_type = "application/json") => {
  showSpinner();
  const urlBase = import.meta.env.VITE_PROD_URL || "http://localhost:5000";
  let url = `${urlBase}/api/${endpoint}`; 
  const headers = {};

  // Si se proporciona un token, se agrega al encabezado
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Configuración inicial de la solicitud
  const options = {
    method,
    headers,
  };

  // Si la solicitud tiene un cuerpo y no es GET, se agrega al cuerpo de la solicitud
  if (data) {
    if (method === "GET") {
      const params = new URLSearchParams(data).toString();
      url += `?${params}`; // Se agregan los parámetros a la URL para solicitudes GET
    } else if (data instanceof FormData) {
      options.body = data;
    } else {
      // Para otros métodos, convertimos `data` a JSON
      options.headers["Content-Type"] = content_type;
      options.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      // Manejo de errores si la respuesta no es exitosa
      const errorData = await response.json();
      hideSpinner();
      throw new Error(errorData.message || "Error en la solicitud");
    }
    // Si la respuesta es exitosa, devolver los datos
    hideSpinner();
    return await response.json();
  } catch (error) {
    console.error("Error en la solicitud:", error);
    hideSpinner();
    throw error;
  }
};


export const getCoordinatesFromAddress = async (address) => {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
  const data = await response.json();
  if (data.length > 0) {
    return { lat: data[0].lat, lng: data[0].lon };
  } else {
    throw new Error("Dirección no encontrada");
  }
};