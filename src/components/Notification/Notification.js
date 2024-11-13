import "./Notification.css";

export const showNotification = (message, isSuccess = true) => {
    // Crear el elemento de notificación
    const notification = document.createElement("div");
    notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
    notification.textContent = message;
    
    // Agregar la notificación al DOM
    document.body.appendChild(notification);
  
    // Mostrar la notificación con la clase "show" para activar las animaciones de CSS
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);
  
    // Ocultar y eliminar la notificación después de 3 segundos
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 500); // Tiempo para la transición de salida
    }, 3000);
  };
  