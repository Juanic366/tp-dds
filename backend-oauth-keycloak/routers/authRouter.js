import { Router } from "express";

import oauthService from "../services/oauthService.js";
import tokenExtractor from "../middlewares/tokenExtractor.js";
import { requiereUsuario, requiereRol } from "../middlewares/authorization.js";

const router = Router();

router.get("/login", (req, res) => {
    const loginUrl = oauthService.iniciarLogin();
    res.redirect(loginUrl);
});

router.get("/callback", async (req, res) => {
    const { code, state, error } = req.query;
    if (error) {
        return res.status(401).json({ error: String(error) });
    }
    if (!code || !state) {
        return res.status(400).json({
            error: "Callback inválido: faltan code o state"
        });
    }
    try {
        const tokens = await oauthService.intercambiarCodigoPorTokens({
            code: String(code),
            state: String(state),
        });
        res.redirect(
            `http://localhost:5173/callback?token=${tokens.access_token}`
        );
    } catch (errorCallback) {
        res.status(500).json({
            error: "No se pudo completar el login",
            detalle: errorCallback.message,
        });
    }
});
router.get("/public", (req, res) => {
    res.json({ mensaje: "Esta ruta es pública" });
});

router.get("/me", tokenExtractor, requiereUsuario, (req, res) => {
    res.json({
        mensaje: "Usuario autenticado",
        usuario: {
            id: req.user.id,
            username: req.user.username,
            nombre: req.user.nombre,
            apellido: req.user.apellido,
            email: req.user.email,
            roles: req.user.roles,
        },
    });
});

router.get("/admin", tokenExtractor, requiereRol("admin"), (req, res) => {
    res.json({
        mensaje: "Ruta exclusiva para administradores",
        usuario: req.user.username,
        roles: req.user.roles,
    });
});

router.get(
    "/debug",
    tokenExtractor,
    (req, res) => {
        console.log(req.user);

        res.json(req.user);
    }
);


export default router;