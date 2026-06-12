// middlewares/authorization.js
export function requiereUsuario(req, res, next) {
 if (!req.user) {
 return res.status(401).json({ error: "Se requiere autenticación" });
 }
 next();
}
export function requiereRol(rol) {
 return (req, res, next) => {
 if (!req.user) {
 return res.status(401).json({ error: "Se requiere autenticación" });
 }
 if (!req.user.roles.includes(rol)) {
 return res.status(403).json({
 error: "No tiene permisos suficientes",
 rolRequerido: rol,
 });
 }
 next();
 };
}