const mensajeLogin = document.getElementById("mensajeLogin");
const mensajeRegistro = document.getElementById("mensajeRegistro");

// Si ya hay sesión iniciada, vamos directo al panel
if (obtenerUsuario()) {
    window.location.href = "panel.html";
}

document.getElementById("formLogin").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultarMensaje(mensajeLogin);

    const datos = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value
    };

    try {
        const usuario = await api("/api/usuarios/login", "POST", datos);
        guardarUsuario(usuario);
        window.location.href = "panel.html";
    } catch (error) {
        mostrarMensaje(mensajeLogin, error.message);
    }
});

document.getElementById("formRegistro").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultarMensaje(mensajeRegistro);

    const nuevo = {
        nombre: document.getElementById("regNombre").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        password: document.getElementById("regPassword").value
    };

    try {
        const usuario = await api("/api/usuarios", "POST", nuevo);
        guardarUsuario(usuario);
        window.location.href = "panel.html";
    } catch (error) {
        mostrarMensaje(mensajeRegistro, error.message);
    }
});
