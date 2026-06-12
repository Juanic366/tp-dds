// app.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import oauthService from "./services/oauthService.js";
import tokenExtractor from "./middlewares/tokenExtractor.js";
import { requiereUsuario, requiereRol } from
    "./middlewares/authorization.js";
const app = express();
const PORT = process.env.PORT ?? 3000;
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send(`
 <html>
 <head>
 <title>Backend OAuth Keycloak</title>
 <link rel="icon" href="data:,">
 <style>
 body { font-family: Arial, sans-serif; background: #f5f5f5;
display: flex; align-items: center; justify-content: center; height: 100vh;
}
 main { background: white; padding: 2rem; border-radius: 12px;
box-shadow: 0 0 12px rgba(0,0,0,.12); max-width: 720px; }
 code { background: #eee; padding: .2rem .4rem; border-radius:
4px; }
 a { display: inline-block; margin-top: 1rem; }
 </style>
 </head>
 <body>
 <main>
 <h1>Backend OAuth + Keycloak</h1>
 <p>Servidor Express corriendo en <strong>http://localhost:${PORT}
</strong></p>
 <p>Para iniciar sesión, ingresar a:</p>
 <p><code>GET /login</code></p>
 <a href="/login">Iniciar login con Keycloak</a>
 </main>
 </body>
 </html>
 `);
});
app.get("/login", (req, res) => {
    const loginUrl = oauthService.iniciarLogin();
    res.redirect(loginUrl);
});
app.get("/auth/callback", async (req, res) => {
    const { code, state, error } = req.query;
    if (error) {
        return res.status(401).json({ error: String(error) });
    }
    if (!code || !state) {
        return res.status(400).json({
            error: "Callback inválido: faltan code o state" });
 }
 try {
            const tokens = await oauthService.intercambiarCodigoPorTokens({
                code: String(code),
                state: String(state),
            });
            res.json({
                mensaje: "Login realizado correctamente. Copiar el access_token para probar las rutas protegidas.",
                token_type: tokens.token_type,
                expires_in: tokens.expires_in,
                access_token: tokens.access_token,
                id_token: tokens.id_token,
                refresh_token: tokens.refresh_token,
            });
        } catch (errorCallback) {
            res.status(500).json({
                error: "No se pudo completar el login",
                detalle: errorCallback.message,
            });
        }
    });
app.get("/api/public", (req, res) => {
    res.json({ mensaje: "Esta ruta es pública" });
});
app.get("/api/me", tokenExtractor, requiereUsuario, (req, res) => {
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
app.get("/api/admin", tokenExtractor, requiereRol("admin"), (req, res) => {
    res.json({
        mensaje: "Ruta exclusiva para administradores",
        usuario: req.user.username,
        roles: req.user.roles,
    });
});
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
