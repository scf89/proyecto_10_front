
import { Header } from "../../components/Header/Header";
import { Home } from "../Home/Home";
import "./LoginRegister.css";
import { showSpinner, hideSpinner } from "../../components/Spinner/Spinner";
import { apiFetch } from "../../api/api";

// Componente principal que muestra inicialmente el formulario de login
export const LoginRegister = () => {
  const main = document.querySelector("main");
  main.innerHTML = "";

  // Cargamos el formulario de login por defecto
  showLogin(main);
};

// Función para alternar y mostrar el formulario de login
const showLogin = (main) => {
  main.innerHTML = "";
  const loginDiv = document.createElement("div");
  Login(loginDiv);
  loginDiv.id = "login";
  main.append(loginDiv);
};

// Función para alternar y mostrar el formulario de registro
const showRegister = (main) => {
  main.innerHTML = "";
  const registerDiv = document.createElement("div");
  Register(registerDiv);
  registerDiv.id = "register";
  main.append(registerDiv);
};

// Componente del formulario de login
const Login = (elementoPadre) => {
    const form = document.createElement("form");

    const inputEmail = document.createElement("input");
    const inputPass = document.createElement("input");
    const button = document.createElement("button");

    inputPass.type = "password";
    inputEmail.placeholder = "email";
    inputPass.placeholder = "*****";
    button.textContent = "Login";
  const switchToRegister = document.createElement("p");
  switchToRegister.textContent = "Don't have an account? Sign up";
  switchToRegister.style.cursor = "pointer";
  switchToRegister.style.color = "blue";

  form.append(inputEmail, inputPass, button, switchToRegister);
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submit(null,inputEmail.value, inputPass.value, form, "login");
  });

  switchToRegister.addEventListener("click", () => showRegister(document.querySelector("main")));

  elementoPadre.append(form);
};

// Componente del formulario de registro
const Register = (elementoPadre) => {
    const form = document.createElement("form");
  const inputEmail = document.createElement("input");
  const inputUN = document.createElement("input");
  const inputPass = document.createElement("input");
  const inputPassConfirm = document.createElement("input");
  const switchToLogin = document.createElement("p");
  const button = document.createElement("button");

  inputEmail.type = "email";
  inputEmail.placeholder = "Email";
  inputUN.placeholder = "User Name";
  inputPass.type = "password";
  inputPass.placeholder = "Password";
  inputPassConfirm.type = "password";
  inputPassConfirm.placeholder = "Confirm Password";
  button.textContent = "Register";
  switchToLogin.textContent = "Already have an account? Log in";
  switchToLogin.style.cursor = "pointer";
  switchToLogin.style.color = "blue";

  form.append(inputEmail, inputUN, inputPass, inputPassConfirm,button, switchToLogin);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Aquí podrías agregar lógica para validar que inputPass y inputPassConfirm coincidan
    if (inputPass.value !== inputPassConfirm.value) {
      displayError("Las contraseñas no coinciden", form);
      return;
    }
    submit(inputUN.value, inputEmail.value, inputPass.value, form, "register");
  });

  switchToLogin.addEventListener("click", () => showLogin(document.querySelector("main")));

  elementoPadre.append(form);
};

const submit = async (userName, email, password, form, type) => {
  
  // Determinamos el endpoint y el cuerpo de la solicitud en función del tipo
  const endpoint = type === "login" ? "users/login" : "users/register";
  const data = type === "register" ? { userName, email, password } : { email, password };

  try {
    // Usamos `apiFetch` para hacer la solicitud
    const respuestaFinal = await apiFetch(endpoint, "POST", data);

    const pError = document.querySelector(".error");
    if (pError) pError.remove();

    if (type === "login") {
      // Guardamos el token y el usuario en localStorage
      localStorage.setItem("token", respuestaFinal.token);
      localStorage.setItem("user", JSON.stringify(respuestaFinal.user));
      Home();
      Header();
    } else if (type === "register") {
      // Si el registro es exitoso, hacemos login automáticamente
      submit(null, email, password, form, "login");
    }
  } catch (error) {
    if (error.message.includes("401")) {
      displayError("Usuario o contraseña incorrectos", form);
    } else {
      console.error("Error en la solicitud:", error);
      displayError(error.message, form);
    }
  }
};


// Función para mostrar errores en el formulario
const displayError = (message, form) => {
  const pError = document.querySelector(".error");
  if (pError) pError.remove();

  const error = document.createElement("p");
  error.classList.add("error");
  error.textContent = message;
  error.style.color = "red";
  form.append(error);
};
