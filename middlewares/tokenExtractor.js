// middlewares/tokenExtractor.js
import { createRemoteJWKSet, jwtVerify } from "jose";
const baseUrl = process.env.KEYCLOAK_BASE_URL;
const realm = process.env.KEYCLOAK_REALM;
const clientId = process.env.KEYCLOAK_CLIENT_ID;
const issuer = `${baseUrl}/realms/${realm}`;
const jwksUri = `${issuer}/protocol/openid-connect/certs`;
const JWKS = createRemoteJWKSet(new URL(jwksUri));
export default async function tokenExtractor(req, res, next) {
    const authorization = req.get("authorization");
    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
        return res.status(401).json({ error: "Token no informado" });
    }
    const token = authorization.substring(7);
    try {
        const { payload } = await jwtVerify(token, JWKS, {
            issuer,
            //  audience: clientId,
        });
        req.user = {
            id: payload.sub,
            username: payload.preferred_username,
            nombre: payload.given_name,
            apellido: payload.family_name,
            email: payload.email,
            roles: payload.realm_access?.roles ?? [],
            claims: payload,
        };
        next();
    } catch (error) {
        return res.status(401).json({
            error: "Token inválido o expirado",
            detalle: error.message,
        });
    }
}
