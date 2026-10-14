package com.aplicacion.steamlite.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.aplicacion.steamlite.model.Juego;
import com.aplicacion.steamlite.repository.JuegoRepository;
import com.aplicacion.steamlite.repository.UsuarioRepository;

@Service
public class JuegoService {

    private final JuegoRepository juegoRepository;
    private final UsuarioRepository usuarioRepository;

    public JuegoService(JuegoRepository juegoRepository, UsuarioRepository usuarioRepository) {
        this.juegoRepository = juegoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Tienda: todos los juegos de todos los desarrolladores
    public List<Juego> listar() {
        return juegoRepository.findAll();
    }

    public List<Juego> buscar(String texto) {
        return juegoRepository.findByTituloContainingIgnoreCase(texto);
    }

    public Juego buscarPorId(Long id) {
        return juegoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Juego no encontrado"));
    }

    // Panel del desarrollador: solo sus juegos
    public List<Juego> listarPorUsuario(Long usuarioId) {
        return juegoRepository.findByUsuarioId(usuarioId);
    }

    public List<Juego> buscarPorUsuario(Long usuarioId, String texto) {
        return juegoRepository.findByUsuarioIdAndTituloContainingIgnoreCase(usuarioId, texto);
    }

    public Juego crear(Juego juego) {
        if (juego.getUsuarioId() == null || !usuarioRepository.existsById(juego.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario indicado no existe");
        }
        validar(juego);
        if (juegoRepository.existsByTituloIgnoreCase(juego.getTitulo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un juego con ese título");
        }
        juego.setId(null);
        return juegoRepository.save(juego);
    }

    public Juego modificar(Long id, Juego datos) {
        Juego existente = buscarPorId(id);
        validar(datos);
        if (juegoRepository.existsByTituloIgnoreCaseAndIdNot(datos.getTitulo(), id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un juego con ese título");
        }
        existente.setTitulo(datos.getTitulo());
        existente.setDescripcion(datos.getDescripcion());
        existente.setGenero(datos.getGenero());
        existente.setPrecio(datos.getPrecio());
        existente.setImagenUrl(datos.getImagenUrl());
        // usuarioId se conserva: un juego no cambia de desarrollador
        return juegoRepository.save(existente);
    }

    public void eliminar(Long id) {
        if (!juegoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Juego no encontrado");
        }
        juegoRepository.deleteById(id);
    }

    private void validar(Juego juego) {
        if (juego.getTitulo() == null || juego.getTitulo().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El título es obligatorio");
        }
        // Sin espacios de más: "Dark Souls " cuenta como el mismo título que "Dark Souls"
        juego.setTitulo(juego.getTitulo().trim());
        if (juego.getTitulo().length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El título no puede superar los 100 caracteres");
        }
        if (juego.getGenero() == null || juego.getGenero().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El género es obligatorio");
        }
        if (juego.getPrecio() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El precio es obligatorio");
        }
        if (juego.getPrecio() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El precio no puede ser negativo");
        }
        if (juego.getDescripcion() != null && juego.getDescripcion().length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La descripción no puede superar los 1000 caracteres");
        }
        if (juego.getImagenUrl() != null && juego.getImagenUrl().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La URL de la imagen es demasiado larga");
        }
    }
}
