

import "./Home.css";
import { apiFetch } from "../../api/api";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { showNotification } from "../../components/Notification/Notification";



export const Home = async () => {
  const main = document.querySelector("main");
  main.innerHTML = "";

  // Realizamos el fetch a la API de eventos
  const data = await apiFetch("events");
  // Obtenemos los eventos
  const eventos = data;

  // Pintamos los eventos
  pintarEventos(eventos, main);
};

export const pintarEventos = (eventos, elementoPadre) => {
  const divEventos = document.createElement("div");
  divEventos.className = "eventos";
  for (const evento of eventos) {
    const divEvento = document.createElement("div");
    const titulo = document.createElement("h3");
    const fecha = document.createElement("p");
    const descripcion = document.createElement("p");
    descripcion.classList.add('descripcion');
    const caratula = document.createElement("img");
    const info = document.createElement("p");

    const user = JSON.parse(localStorage.getItem("user"));
    let like;
    if(user){
      // Agregar asistencia a evento
      like = document.createElement("i");
      like.className = "fas like";


      // Aquí puedes personalizar si el usuario ya asiste al evento
      if (user.eventsAttending?.includes(evento._id)) {
        like.classList.remove('fa-calendar-check');
        like.classList.add('fa-calendar-xmark');
        like.title='Cancel asistance';
        like.addEventListener("click", () => removeAsistencia(evento._id));
      } else {
        like.classList.remove('fa-calendar-xmark');
        like.classList.add('fa-calendar-check');
        like.title='Confirm asistance';
        like.addEventListener("click", () => addAsistencia(evento._id));
    }
    }


    divEvento.className = "evento";
    titulo.textContent = evento.title;
    fecha.textContent = `Fecha: ${new Date(evento.date).toLocaleDateString()}`;
    descripcion.textContent = evento.description;
    caratula.src = evento.image || "/assets/default-event.jpg";  // Imagen de evento
    info.textContent = `${evento.address || "Ubicación no disponible"}`;

    // Agregar el evento de clic para abrir el modal
    titulo.style.cursor = "pointer";
    titulo.addEventListener("click", () => abrirModal(evento));

    divEvento.append(titulo, fecha, descripcion, caratula, info);
    if (like) divEvento.append(like);
    divEventos.append(divEvento);
  }

  elementoPadre.append(divEventos);
};


// Modal
const modal = document.createElement("div");
modal.classList.add("modal");
modal.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2 id="modal-title"></h2>
    <img id="modal-image" src="" alt="" class="modal-image" />
    <p id="modal-date"></p>
    <p id="modal-description"></p>
    <p id="modal-address"></p>
    <div id="modal-map"></div> <!-- Espacio para el mapa -->
    <div id="modal-attendees"></div>
  </div>
`;
document.body.appendChild(modal);

let map; // Variable global para almacenar el mapa
let marker;
// Abrir modal
const abrirModal = (evento) => {
  const modalTitle = document.getElementById("modal-title");
  const modalDate = document.getElementById("modal-date");
  const modalDescription = document.getElementById("modal-description");
  const modalAddress = document.getElementById("modal-address");
  const modalAttendees = document.getElementById("modal-attendees");
  const modalImage = document.getElementById("modal-image");
  const modalMap = document.getElementById("modal-map");

  // Rellenar el contenido del modal
  modalTitle.textContent = evento.title;
  modalDate.textContent = `Fecha: ${new Date(evento.date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`;
  modalDescription.textContent = evento.description;
  modalAddress.textContent = evento.address;

  modalImage.src = evento.image || "/assets/default-event.jpg"; 
  modalImage.alt = evento.title;

  // Mostrar lista de asistentes
  modalAttendees.innerHTML = "<strong>Asistentes:</strong><ul>";
  evento.attendees.forEach((attendee) => {
    modalAttendees.innerHTML += `<li>${attendee.userName}</li>`;
  });
  modalAttendees.innerHTML += "</ul>";

  // Mostrar el modal
  modal.style.display = "block";

  // Configurar e inicializar el mapa de Leaflet
  if(evento.location){
    if(!map){
      map = L.map("modal-map").setView([evento.location.lat, evento.location.lng], 13);
  
      // Añadir la capa base de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
  
    } else {
      map.setView([evento.location.lat, evento.location.lng], 13);
    }
    if (marker) {
      // Si el marcador ya existe, actualizar su posición
      marker.setLatLng([evento.location.lat, evento.location.lng]);
      marker.getPopup().setContent(evento.address || "Location event");
    } else {
      // Añadir un marcador en la ubicación del evento
      marker = L.marker([evento.location.lat, evento.location.lng]).addTo(map)
        .bindPopup(evento.address || "Location event")
        .openPopup();
    }
    modalMap.style.display = "block";
  } else {
    modalMap.style.display = "none";
  }
  
  
};

// Cerrar modal
const closeModal = () => {
  modal.style.display = "none";
};

// Agregar evento para cerrar el modal
document.querySelector(".close").addEventListener("click", closeModal);

// Cerrar el modal si el usuario hace clic fuera de la ventana del modal
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});


const addAsistencia = async (idEvento) => {
  const user = JSON.parse(localStorage.getItem("user"));

  try {
    // Usamos `apiFetch` con los parámetros necesarios
    const updatedUser = await apiFetch(`eventuser/${idEvento}/attendees`, "PATCH", null, localStorage.getItem("token"));

    // Actualizamos el usuario en localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));

    showNotification("Attendance successfully added to the event.",true);

    Home(); // Redirigimos o actualizamos la vista
  } catch (error) {
    console.error("Error en la petición:", error);
    showNotification("There was an error processing the attendance.",false);
  }
};

const removeAsistencia = async (idEvento) => {
  const user = JSON.parse(localStorage.getItem("user"));

  try {
    // Usamos `apiFetch` para eliminar al usuario de la lista de asistentes del evento
    const updatedUser = await apiFetch(`eventuser/${idEvento}/attendees`, "DELETE", null, localStorage.getItem("token"));

    // Actualizamos el usuario en localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));

    showNotification("Attendance successfully removed to the event.",true);
    Home(); // Recargar los eventos para reflejar el cambio
  } catch (error) {
    console.error("Error en la petición:", error);
    showNotification("There was an error removing the attendance.",false);
  }
};






