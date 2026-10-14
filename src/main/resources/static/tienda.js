const grilla = document.getElementById("grilla");
const mensaje = document.getElementById("mensaje");
const textoBuscar = document.getElementById("textoBuscar");

pintarSesion();

function renderizar(juegos) {
    if (juegos.length === 0) {
        grilla.innerHTML = `<p class="vacio">No se encontraron juegos.</p>`;
        return;
    }

    grilla.innerHTML = juegos.map(juego => `
        <article class="tarjeta">
            ${htmlPortada(juego)}
            <div class="tarjeta-cuerpo">
                <div class="tarjeta-titulo">${escapar(juego.titulo)}</div>
                <div class="tarjeta-desc">${escapar(juego.descripcion)}</div>
                <div class="tarjeta-pie">
                    <span class="genero">${escapar(juego.genero || "Sin género")}</span>
                    <span class="precio">${formatearPrecio(juego.precio)}</span>
                </div>
            </div>
        </article>
    `).join("");
}

// Cuenta las búsquedas para descartar respuestas viejas que lleguen tarde
let numeroBusqueda = 0;

async function cargarJuegos(texto = "") {
    ocultarMensaje(mensaje);
    const esta = ++numeroBusqueda;
    try {
        const url = texto
            ? `/api/juegos/buscar?texto=${encodeURIComponent(texto)}`
            : "/api/juegos";
        const juegos = await api(url);
        if (esta === numeroBusqueda) renderizar(juegos);
    } catch (error) {
        if (esta !== numeroBusqueda) return;
        grilla.innerHTML = "";
        mostrarMensaje(mensaje, "No se pudieron cargar los juegos: " + error.message);
    }
}

document.getElementById("formBuscar").addEventListener("submit", (evento) => {
    evento.preventDefault();
    cargarJuegos(textoBuscar.value.trim());
});

// Filtra a medida que se escribe
textoBuscar.addEventListener("input", alDejarDeEscribir(() => {
    cargarJuegos(textoBuscar.value.trim());
}));

document.getElementById("btnLimpiar").addEventListener("click", () => {
    textoBuscar.value = "";
    cargarJuegos();
});

cargarJuegos();
