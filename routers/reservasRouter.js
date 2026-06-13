import { Router } from "express";

import tokenExtractor from "../middlewares/tokenExtractor.js";
import { requiereUsuario, requiereRol } from "../middlewares/authorization.js";

import * as service from "../services/reservasService.js";

const router = Router();

// GET /api/reservas?fecha=&estado=&aulaId=&q=&page=&limit=&sortBy=&order=
router.get(
  "/",
  tokenExtractor,
  requiereUsuario,
  async (req, res) => {
    const reservas = await service.obtenerTodas(req.query);

    res.json(reservas);
  }
);

// GET /api/reservas/resumen
router.get(
  "/resumen",
  tokenExtractor,
  requiereRol("admin"),
  async (req, res) => {
    res.json(await service.resumen());
  }
);

// GET /api/reservas/:id
router.get(
  "/:id",
  tokenExtractor,
  requiereUsuario,
  async (req, res) => {
    const reserva = await service.obtenerPorId(req.params.id);

    res.json(reserva);
  }
);

// POST /api/reservas
router.post(
  "/",
  tokenExtractor,
  requiereUsuario,
  async (req, res) => {

    const nueva = await service.crear(
      req.body,
      req.user.id
    );

    res.status(201).json(nueva);
  }
);

// PUT /api/reservas/:id
router.put(
  "/:id",
  tokenExtractor,
  requiereUsuario,
  async (req, res) => {

    const actualizada = await service.modificar(
      req.params.id,
      req.body,
      req.user
    );

    res.json(actualizada);
  }
);

// PATCH /api/reservas/:id/cancelar
router.patch(
  "/:id/cancelar",
  tokenExtractor,
  requiereUsuario,
  async (req, res) => {

    const reserva = await service.cambiarEstado(
      req.params.id,
      "cancelada",
      req.user
    );

    res.json(reserva);
  }
);

// PATCH /api/reservas/:id/aprobar
router.patch(
  "/:id/aprobar",
  tokenExtractor,
  requiereRol("admin"),
  async (req, res) => {

    const reserva = await service.cambiarEstado(
      req.params.id,
      "aprobada",
      req.user
    );

    res.json(reserva);
  }
);

// PATCH /api/reservas/:id/rechazar
router.patch(
  "/:id/rechazar",
  tokenExtractor,
  requiereRol("admin"),
  async (req, res) => {

    const reserva = await service.cambiarEstado(
      req.params.id,
      "rechazada",
      req.user
    );

    res.json(reserva);
  }
);

export default router;