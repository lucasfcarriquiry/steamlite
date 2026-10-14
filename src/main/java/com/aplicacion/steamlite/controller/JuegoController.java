package com.aplicacion.steamlite.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.aplicacion.steamlite.model.Juego;
import com.aplicacion.steamlite.service.JuegoService;

@RestController
@RequestMapping("/api/juegos")
public class JuegoController {

    private final JuegoService juegoService;

    public JuegoController(JuegoService juegoService) {
        this.juegoService = juegoService;
    }

    @GetMapping
    public List<Juego> listar() {
        return juegoService.listar();
    }

    @GetMapping("/buscar")
    public List<Juego> buscar(@RequestParam String texto) {
        return juegoService.buscar(texto);
    }

    @GetMapping("/{id}")
    public Juego buscarPorId(@PathVariable Long id) {
        return juegoService.buscarPorId(id);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Juego> listarPorUsuario(@PathVariable Long usuarioId) {
        return juegoService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/usuario/{usuarioId}/buscar")
    public List<Juego> buscarPorUsuario(@PathVariable Long usuarioId, @RequestParam String texto) {
        return juegoService.buscarPorUsuario(usuarioId, texto);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Juego crear(@RequestBody Juego juego) {
        return juegoService.crear(juego);
    }

    @PutMapping("/{id}")
    public Juego modificar(@PathVariable Long id, @RequestBody Juego juego) {
        return juegoService.modificar(id, juego);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        juegoService.eliminar(id);
    }
}
