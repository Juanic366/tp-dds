import Aula from "../models/Aula.js";

export async function obtenerTodas() {
  return Aula.findAll();
}

export async function obtenerPorId(id) {
  return Aula.findByPk(id);
}

export async function crear(data) {
  return Aula.create(data);
}

export async function actualizar(id, data) {
  const aula = await Aula.findByPk(id);

  if (!aula) {
    throw new Error("Aula no encontrada");
  }

  await aula.update(data);

  return aula;
}

export async function eliminar(id) {
  const aula = await Aula.findByPk(id);

  if (!aula) {
    throw new Error("Aula no encontrada");
  }

  await aula.destroy();
}