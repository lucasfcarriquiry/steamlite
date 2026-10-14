const usuario = obtenerUsuario();

// El panel solo se puede usar con sesión iniciada
if (!usuario) {
    window.location.href = "login.html";
}

const lista = document.getElementById("lista");
const formJuego = document.getElementById("formJuego");
const tituloForm = document.getElementById("tituloForm");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const textoBuscar = document.getElementById("textoBuscar");
const mensajeForm = document.getElementById("mensajeForm");
const mensajeLista = document.getElementById("mensajeLista");
const mensajeCuenta = document.getElementById("mensajeCuenta");

// id del juego que se está editando (null = estamos publicando uno nuevo)
let idEditando = null;
let juegosActuales = [];

pintarSesion();

// ---------- Listado ----------

function renderizar(juegos) {
    juegosActuales = juegos;

    if (juegos.length === 0) {
        lista.innerHTML = `<p class="vacio">No hay juegos para mostrar.</p>`;
        return;
    }

    lista.innerHTML = juegos.map(juego => `
        <div class="fila-juego">
            ${htmlPortada(juego)}
            <div class="fila-info">
                <div class="tarjeta-titulo">${escapar(juego.titulo)}</div>
                <span class="genero">${escapar(juego.genero || "Sin género")}</span>
                <span class="precio">${formatearPrecio(juego.precio)}</span>
            </div>
            <div class="fila-acciones">
                <button class="secundario" onclick="editarJuego(${juego.id})">Editar</button>
                <button class="peligro" onclick="eliminarJuego(${juego.id})">Eliminar</button>
            </div>
        </div>
    `).join("");
}

// Cuenta las búsquedas para descartar respuestas viejas que lleguen tarde
let numeroBusqueda = 0;

async function cargarMisJuegos(texto = "") {
    ocultarMensaje(mensajeLista);
    const esta = ++numeroBusqueda;
    try {
        const url = texto
            ? `/api/juegos/usuario/${usuario.id}/buscar?texto=${encodeURIComponent(texto)}`
            : `/api/juegos/usuario/${usuario.id}`;
        const juegos = await api(url);
        if (esta === numeroBusqueda) renderizar(juegos);
    } catch (error) {
        if (esta !== numeroBusqueda) return;
        lista.innerHTML = "";
        mostrarMensaje(mensajeLista, "No se pudieron cargar tus juegos: " + error.message);
    }
}

document.getElementById("formBuscar").addEventListener("submit", (evento) => {
    evento.preventDefault();
    cargarMisJuegos(textoBuscar.value.trim());
});

// Filtra a medida que se escribe
textoBuscar.addEventListener("input", alDejarDeEscribir(() => {
    cargarMisJuegos(textoBuscar.value.trim());
}));

document.getElementById("btnLimpiar").addEventListener("click", () => {
    textoBuscar.value = "";
    cargarMisJuegos();
});

// ---------- Publicar / editar ----------

function leerFormulario() {
    return {
        titulo: document.getElementById("titulo").value.trim(),
        genero: document.getElementById("genero").value,
        precio: document.getElementById("precio").value === "" ? null : Number(document.getElementById("precio").value),
        imagenUrl: document.getElementById("imagenUrl").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        usuarioId: usuario.id
    };
}

function resetearFormulario() {
    idEditando = null;
    formJuego.reset();
    tituloForm.textContent = "Publicar juego";
    btnGuardar.textContent = "Publicar";
    btnCancelar.hidden = true;
}

function editarJuego(id) {
    const juego = juegosActuales.find(j => j.id === id);
    if (!juego) return;

    idEditando = id;
    document.getElementById("titulo").value = juego.titulo;
    document.getElementById("genero").value = juego.genero;
    document.getElementById("precio").value = juego.precio;
    document.getElementById("imagenUrl").value = juego.imagenUrl || "";
    document.getElementById("descripcion").value = juego.descripcion || "";

    tituloForm.textContent = "Editar juego";
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.hidden = false;
    ocultarMensaje(mensajeForm);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

formJuego.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultarMensaje(mensajeForm);
    const juego = leerFormulario();

    try {
        if (idEditando === null) {
            await api("/api/juegos", "POST", juego);
            mostrarMensaje(mensajeForm, "¡Juego publicado en la tienda!", "ok");
        } else {
            await api(`/api/juegos/${idEditando}`, "PUT", juego);
            mostrarMensaje(mensajeForm, "Juego actualizado.", "ok");
        }
        resetearFormulario();
        cargarMisJuegos(textoBuscar.value.trim());
    } catch (error) {
        mostrarMensaje(mensajeForm, error.message);
    }
});

btnCancelar.addEventListener("click", () => {
    resetearFormulario();
    ocultarMensaje(mensajeForm);
});

async function eliminarJuego(id) {
    const juego = juegosActuales.find(j => j.id === id);
    if (!confirm(`¿Eliminar "${juego ? juego.titulo : "este juego"}" de la tienda?`)) return;

    try {
        await api(`/api/juegos/${id}`, "DELETE");
        if (idEditando === id) resetearFormulario();
        cargarMisJuegos(textoBuscar.value.trim());
    } catch (error) {
        mostrarMensaje(mensajeLista, "No se pudo eliminar: " + error.message);
    }
}

// ---------- Mi cuenta ----------

function cargarCuenta() {
    document.getElementById("cuentaNombre").value = usuario.nombre;
    document.getElementById("cuentaEmail").value = usuario.email;
    document.getElementById("cuentaPassword").value = usuario.password;
}

document.getElementById("formCuenta").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultarMensaje(mensajeCuenta);

    const datos = {
        nombre: document.getElementById("cuentaNombre").value.trim(),
        email: document.getElementById("cuentaEmail").value.trim(),
        password: document.getElementById("cuentaPassword").value
    };

    try {
        const actualizado = await api(`/api/usuarios/${usuario.id}`, "PUT", datos);
        guardarUsuario(actualizado);
        Object.assign(usuario, actualizado);
        pintarSesion();
        mostrarMensaje(mensajeCuenta, "Datos actualizados.", "ok");
    } catch (error) {
        mostrarMensaje(mensajeCuenta, error.message);
    }
});

document.getElementById("btnEliminarCuenta").addEventListener("click", async () => {
    if (!confirm("¿Eliminar tu cuenta? También se borrarán todos tus juegos publicados.")) return;

    try {
        await api(`/api/usuarios/${usuario.id}`, "DELETE");
        cerrarSesion();
    } catch (error) {
        mostrarMensaje(mensajeCuenta, error.message);
    }
});

if (usuario) {
    cargarCuenta();
    cargarMisJuegos();
}
