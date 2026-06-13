// app.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routers/authRouter.js"
import aulasRouter from "./routers/aulasRouter.js"
import reservasRouter from "./routers/reservasRouter.js"
import { initDb } from "./models/syncDb.js";

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
 <p><code>GET /auth/login</code></p>
 <a href="/auth/login">Iniciar login con Keycloak</a>
 </main>
 </body>
 </html>
 `);
});

//Auth
app.use("/auth", authRouter);

// Recursos
app.use("/api/aulas", aulasRouter);
app.use("/api/reservas", reservasRouter);

//404
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

await initDb();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
