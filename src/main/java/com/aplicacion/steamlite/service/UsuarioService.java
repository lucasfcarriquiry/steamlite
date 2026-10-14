package com.aplicacion.steamlite.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.aplicacion.steamlite.model.Usuario;
import com.aplicacion.steamlite.repository.JuegoRepository;
import com.aplicacion.steamlite.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final JuegoRepository juegoRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, JuegoRepository juegoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.juegoRepository = juegoRepository;
    }

    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    public Usuario crear(Usuario usuario) {
        validar(usuario);
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un usuario con ese email");
        }
        usuario.setId(null);
        return usuarioRepository.save(usuario);
    }

    public Usuario modificar(Long id, Usuario datos) {
        Usuario existente = buscarPorId(id);
        validar(datos);
        if (!existente.getEmail().equalsIgnoreCase(datos.getEmail())
                && usuarioRepository.existsByEmail(datos.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un usuario con ese email");
        }
        existente.setNombre(datos.getNombre());
        existente.setEmail(datos.getEmail());
        existente.setPassword(datos.getPassword());
        return usuarioRepository.save(existente);
    }

    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }
        // Sin relaciones JPA no hay borrado en cascada: borramos a mano los juegos del desarrollador
        juegoRepository.deleteAll(juegoRepository.findByUsuarioId(id));
        usuarioRepository.deleteById(id);
    }

    // Login educativo: NO es seguro para una aplicación real
    public Usuario login(String email, String password) {
        Optional<Usuario> resultado = usuarioRepository.findByEmailAndPassword(email, password);

        if (resultado.isPresent()) {
            return resultado.get();
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos");
    }

    private void validar(Usuario usuario) {
        if (vacio(usuario.getNombre()) || vacio(usuario.getEmail()) || vacio(usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre, email y contraseña son obligatorios");
        }
        if (!usuario.getEmail().contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email no es válido");
        }
        if (usuario.getNombre().length() > 100 || usuario.getEmail().length() > 100 || usuario.getPassword().length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre, email y contraseña no pueden superar los 100 caracteres");
        }
    }

    private boolean vacio(String texto) {
        return texto == null || texto.isBlank();
    }
}
