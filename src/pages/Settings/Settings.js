import { pintarEventos } from "../Home/Home";
import "./Settings.css";
import { apiFetch, getCoordinatesFromAddress } from "../../api/api";
import { showNotification } from "../../components/Notification/Notification";

export const Settings = async () => {
  const main = document.querySelector("main");
  main.innerHTML = "";

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  
  const usuario = await apiFetch(`users/${user._id}`, "GET", null, token);

  

  // Añadir icono para abrir el formulario de creación de evento
  const addEventIcon = document.createElement("i");
  addEventIcon.className = "fas fa-calendar-plus add-event-icon";
  addEventIcon.addEventListener("click", () => toggleEventForm());

  main.appendChild(addEventIcon);

  const form = document.createElement("form");
  form.id = "event-form";
  form.innerHTML = `
    <h3>New Event</h3>
    <input type="text" id="title" name="title" placeholder=Title required />

    <input type="datetime-local" id="date" name="date" required />

    <textarea id="description" name="description" placeholder="Desccription" required></textarea>

    <input type="text" id="address" name="address" placeholder="Address" required />

    <label for="image">Image (opcional)</label>
    <input type="file" id="image" name="image" accept="image/*" />

    <button type="submit">Create Event</button>
  `;

  form.style.display = "none"; // Inicialmente oculto

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await createEvent(form);
  });

  main.appendChild(form);

  // Pintar los eventos del usuario
  pintarEventos(usuario.eventsAttending, main);

};

// Función para alternar la visibilidad del formulario
const toggleEventForm = () => {
  const form = document.getElementById("event-form");
  form.style.display = form.style.display === "none" ? "flex" : "none";
};

// Función para enviar el formulario y crear un evento


const createEvent = async (form) => {
  const title = form.title.value;
  const date = form.date.value;
  const description = form.description.value;
  const address = form.address.value;
  const image = form.image.files[0]; // Obtener el archivo de imagen del input

  const token = localStorage.getItem("token");

  let coordinates;
  try {
    coordinates = await getCoordinatesFromAddress(address);
  } catch (error) {
    showNotification("No se pudieron obtener las coordenadas de la dirección.",false);
    return;
  }


  // Crear una instancia de FormData y agregar los campos
  const formData = new FormData();
  formData.append("title", title);
  formData.append("date", date);
  formData.append("description", description);
  formData.append("address", address);
  formData.append("location", JSON.stringify({ lat: coordinates.lat, lng: coordinates.lng }));

  if (image) {
    formData.append("image", image); // Agregar la imagen si está presente
  }

  // Usar apiFetch para enviar el FormData
  try {
    const data = await apiFetch("events", "POST", formData, token);
    if (data) {
      showNotification("Evento creado con éxito!", true);
      location.reload();
    }
  } catch (error) {
    showNotification("Error al crear el evento.",false);
  }
};

