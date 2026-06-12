import { Router } from "express";

import * as aulaService from "../services/aulasservice.js";

import tokenExtractor from "../middlewares/tokenExtractor.js";
import { requiereRol } from "../middlewares/authorization.js";

const router = Router();

// Obtener todas las aulas
router.get("/", async (req, res, next) => {
  try {
    const aulas = await aulaService.obtenerTodas();

    res.json(aulas);

  } catch (error) {
    next(error);
  }
});

//Obtener un aula por id
router.get("/:id", async (req, res, next) => {
  try {
    const aula = await aulaService.obtenerPorId(req.params.id);

    if (!aula) {
      return res.status(404).json({
        error: "Aula no encontrada",
      });
    }

    res.json(aula);

  } catch (error) {
    next(error);
  }
});

//Crear Aula (Solo Admin)
router.post(
  "/",
  tokenExtractor,
  requiereRol("admin"),
  async (req, res, next) => {
    try {
      const aula = await aulaService.crear(req.body);

      res.status(201).json(aula);

    } catch (error) {
      next(error);
    }
  }
);

//Actualizar un aula (Solo Admin)
router.put(
  "/:id",
  tokenExtractor,
  requiereRol("admin"),
  async (req, res, next) => {
    try {
      const aula = await aulaService.actualizar(
        req.params.id,
        req.body
      );

      res.json(aula);

    } catch (error) {
      next(error);
    }
  }
);

//Eiminar un aula (Solo Admin)
router.delete(
  "/:id",
  tokenExtractor,
  requiereRol("admin"),
  async (req, res, next) => {
    try {
      await aulaService.eliminar(req.params.id);

      res.status(204).send();

    } catch (error) {
      next(error);
    }
  }
);

export default router;