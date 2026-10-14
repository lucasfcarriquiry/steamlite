package com.aplicacion.steamlite.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aplicacion.steamlite.model.Juego;

public interface JuegoRepository extends JpaRepository<Juego, Long> {

    List<Juego> findByTituloContainingIgnoreCase(String texto);

    List<Juego> findByUsuarioId(Long usuarioId);

    List<Juego> findByUsuarioIdAndTituloContainingIgnoreCase(Long usuarioId, String texto);

    boolean existsByTituloIgnoreCase(String titulo);

    // Al modificar: busca otro juego con el mismo título, sin contar al que se está editando
    boolean existsByTituloIgnoreCaseAndIdNot(String titulo, Long id);
}
