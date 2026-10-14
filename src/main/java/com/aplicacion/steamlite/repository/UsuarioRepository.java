package com.aplicacion.steamlite.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aplicacion.steamlite.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailAndPassword(String email, String password);

    boolean existsByEmail(String email);
}
