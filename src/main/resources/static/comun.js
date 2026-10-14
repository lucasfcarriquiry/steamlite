// Funciones compartidas por todas las páginas

function obtenerUsuario() {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
}

function guardarUsuario(usuario) {
    localStorage.setItem("usuario", JSON.stringify(usuario));
}

function cerrarSesion() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

// Hace un fetch a la API y lanza un Error con el mensaje del backend si algo falla
async function api(url, metodo = "GET", cuerpo = null) {
    const opciones = { method: metodo, headers: {} };
    if (cuerpo !== null) {
        opciones.headers["Content-Type"] = "application/json";
        opciones.body = JSON.stringify(cuerpo);
    }

    let respuesta;
    try {
        respuesta = await fetch(url, opciones);
    } catch (e) {
        throw new Error("No se pudo conectar con el servidor");
    }

    if (!respuesta.ok) {
        let mensaje = "Error " + respuesta.status;
        try {
            const error = await respuesta.json();
            if (error.message) mensaje = error.message;
            else if (error.detail) mensaje = error.detail;
        } catch (e) { /* la respuesta no era JSON */ }
        throw new Error(mensaje);
    }

    // DELETE devuelve 204 sin cuerpo
    if (respuesta.status === 204) return null;
    return respuesta.json();
}

function mostrarMensaje(elemento, texto, tipo = "error") {
    elemento.textContent = texto;
    elemento.className = "mensaje " + tipo;
}

function ocultarMensaje(elemento) {
    elemento.className = "mensaje";
}

// Evita que el texto ingresado por usuarios se interprete como HTML
function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

// Ejecuta la función recién cuando el usuario deja de escribir por "espera" milisegundos.
// Así no se manda una petición al backend por cada tecla.
function alDejarDeEscribir(funcion, espera = 300) {
    let temporizador;
    return (...argumentos) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => funcion(...argumentos), espera);
    };
}

function formatearPrecio(precio) {
    if (!precio) return "Gratis";
    return "$" + Number(precio).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Portada del juego: la imagen si tiene URL, si no (o si falla) el título sobre un degradé
function htmlPortada(juego) {
    if (juego.imagenUrl) {
        return `<div class="portada"><img src="${escapar(juego.imagenUrl)}" alt="${escapar(juego.titulo)}"
                onerror="this.parentElement.textContent = this.alt"></div>`;
    }
    return `<div class="portada">${escapar(juego.titulo)}</div>`;
}

// Arma la zona de sesión del header según haya o no un usuario logueado
function pintarSesion() {
    const zona = document.getElementById("sesion");
    const usuario = obtenerUsuario();
    if (usuario) {
        zona.innerHTML = `<span class="nombre">${escapar(usuario.nombre)}</span>
                          <button class="secundario" onclick="cerrarSesion()">Cerrar sesión</button>`;
    } else {
        zona.innerHTML = `<a href="login.html">Iniciar sesión</a>`;
    }
}
