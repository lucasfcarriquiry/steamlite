# SteamLite

Trabajo Práctico Final — Aplicación Web Fullstack con Spring Boot y Aiven.

## Temática

Una tienda de videojuegos inspirada (muy) libremente en Steam. Cualquier usuario registrado puede actuar como
**desarrollador**: publica sus juegos, los edita o los elimina desde su **Panel de desarrollador**. Todos los juegos
publicados aparecen en la **Tienda**, que se puede recorrer y filtrar por título.

- **Usuario**: `id`, `nombre`, `email`, `password`.
- **Juego** (entidad principal): `id`, `titulo`, `descripcion`, `genero`, `precio`, `imagenUrl`, `usuarioId`.
  `usuarioId` indica qué usuario (desarrollador) publicó el juego.

## Tecnologías

- Java 21 + Spring Boot (Web MVC, Spring Data JPA)
- MySQL alojado en Aiven
- Frontend estático en HTML, CSS y JavaScript (`fetch`), servido por el mismo Spring Boot

## Cómo iniciar la aplicación

**Requisitos:** Java 21 o superior y conexión a internet (Maven se descarga solo con `mvnw`).

1. Copiar `.env.example` como `.env` en la raíz del proyecto y completar los datos de conexión de Aiven:

   ```
   DB_URL=jdbc:mysql://HOST:PUERTO/defaultdb?sslMode=REQUIRED
   DB_USER=avnadmin
   DB_PASSWORD=...
   ```

   El archivo `.env` está en `.gitignore`: las credenciales reales **no** se suben al repositorio.
   También pueden definirse `DB_URL`, `DB_USER` y `DB_PASSWORD` como variables de entorno.

2. Desde la raíz del proyecto:

   ```bash
   ./mvnw spring-boot:run
   ```

   (En Windows/cmd: `mvnw spring-boot:run`.) Las tablas se crean solas (`ddl-auto=update`).

3. Abrir <http://localhost:8080>.

Para generar un `.jar` ejecutable: `./mvnw clean package` y luego `java -jar target/steamlite.jar`
(ejecutarlo desde una carpeta que contenga el `.env`).

## Páginas

| Página | Descripción |
|---|---|
| `index.html` | Tienda: todos los juegos publicados, con búsqueda por título a medida que se escribe |
| `login.html` | Iniciar sesión y registrarse |
| `panel.html` | Panel de desarrollador: CRUD de los juegos propios, búsqueda entre ellos y edición/eliminación de la cuenta |

## Endpoints principales

### Usuarios — `/api/usuarios`

| Método | Ruta | Descripción | Errores |
|---|---|---|---|
| GET | `/api/usuarios` | Listar usuarios | |
| GET | `/api/usuarios/{id}` | Buscar usuario por id | 404 |
| POST | `/api/usuarios` | Registrar usuario | 400 (datos faltantes/inválidos, email repetido) |
| PUT | `/api/usuarios/{id}` | Modificar usuario | 400, 404 |
| DELETE | `/api/usuarios/{id}` | Eliminar usuario (y sus juegos) | 404 |
| POST | `/api/usuarios/login` | Login con `{ "email", "password" }` | 401 |

### Juegos — `/api/juegos`

| Método | Ruta | Descripción | Errores |
|---|---|---|---|
| GET | `/api/juegos` | Listar todos los juegos (Tienda) | |
| GET | `/api/juegos/{id}` | Buscar juego por id | 404 |
| GET | `/api/juegos/buscar?texto=` | Buscar en toda la Tienda por título | |
| GET | `/api/juegos/usuario/{usuarioId}` | Juegos publicados por un usuario | |
| GET | `/api/juegos/usuario/{usuarioId}/buscar?texto=` | Buscar por título entre los juegos de un usuario | |
| POST | `/api/juegos` | Publicar juego (requiere `usuarioId` existente) | 400 |
| PUT | `/api/juegos/{id}` | Modificar juego (conserva el `usuarioId` original) | 400, 404 |
| DELETE | `/api/juegos/{id}` | Eliminar juego | 404 |

Consultas de Spring Data JPA utilizadas:

```java
Optional<Usuario> findByEmailAndPassword(String email, String password);
List<Juego> findByUsuarioId(Long usuarioId);
List<Juego> findByUsuarioIdAndTituloContainingIgnoreCase(Long usuarioId, String texto);
List<Juego> findByTituloContainingIgnoreCase(String texto);
boolean existsByTituloIgnoreCase(String titulo);                      // título único al publicar
boolean existsByTituloIgnoreCaseAndIdNot(String titulo, Long id);     // título único al modificar
```

El título de un juego es único en toda la Tienda (sin distinguir mayúsculas ni espacios al inicio/final):
publicar o renombrar un juego con un título ya existente devuelve 400 "Ya existe un juego con ese título".

## Cómo probar el flujo registro → login → CRUD → búsqueda

1. Abrir <http://localhost:8080> → **Iniciar sesión** → completar **Crear cuenta**. Se ingresa al Panel.
2. **Cerrar sesión** y volver a entrar con el mismo email y contraseña. Con una contraseña incorrecta aparece
   "Email o contraseña incorrectos" (401).
3. En el Panel, **publicar** uno o más juegos. Aparecen en "Mis juegos publicados" y en la Tienda.
4. **Editar** un juego (botón Editar → Guardar cambios) y **eliminar** otro.
5. Escribir en el buscador del Panel: se filtran solo los juegos del usuario actual. En la Tienda se filtra entre todos.
6. **Persistencia:** detener Spring Boot por completo, volver a iniciarlo e ingresar de nuevo: los datos siguen
   estando porque se guardan en MySQL (Aiven).

> **Login educativo:** no usa Spring Security, JWT ni cifrado; las contraseñas se guardan en texto plano y la
> sesión es el usuario guardado en `localStorage`. Usar solo contraseñas ficticias de prueba.

## Estructura

```
src/main/java/com/aplicacion/steamlite/
├── model/        Usuario.java, Juego.java
├── repository/   UsuarioRepository.java, JuegoRepository.java
├── service/      UsuarioService.java, JuegoService.java   (validaciones y reglas de negocio)
└── controller/   UsuarioController.java, JuegoController.java

src/main/resources/
├── application.properties
└── static/       index.html, login.html, panel.html, styles.css,
                  comun.js, tienda.js, login.js, panel.js
```
