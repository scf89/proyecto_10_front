import "./Spinner.css";

export const Spinner = () => {
  const overlay = document.createElement("div");
  overlay.className = "spinner-overlay";

  const spinner = document.createElement("div");
  spinner.className = "spinner";
  
  overlay.appendChild(spinner);
  return overlay;
};

// Función para mostrar el spinner en la pantalla completa
export const showSpinner = () => {
  const overlay = Spinner();
  document.body.appendChild(overlay);
};

// Función para ocultar el spinner de la pantalla
export const hideSpinner = () => {
  const overlay = document.querySelector(".spinner-overlay");
  if (overlay) {
    overlay.remove();
  }
};
