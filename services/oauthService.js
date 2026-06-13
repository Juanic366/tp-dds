// services/oauthService.js
import crypto from "node:crypto";
const pendingLogins = new Map();
const baseUrl = process.env.KEYCLOAK_BASE_URL;
const realm = process.env.KEYCLOAK_REALM;
const clientId = process.env.KEYCLOAK_CLIENT_ID;
const redirectUri = process.env.KEYCLOAK_REDIRECT_URI;
const authorizationEndpoint = `${baseUrl}/realms/${realm}/protocol/openid-connect/auth`;
const tokenEndpoint = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;
function base64UrlEncode(buffer) {
    return buffer
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}
function generarValorSeguro() {
    return base64UrlEncode(crypto.randomBytes(32));
}
function generarCodeChallenge(codeVerifier) {
    const hash = crypto.createHash("sha256").update(codeVerifier).digest();
    return base64UrlEncode(hash);
}
class OAuthService {
    iniciarLogin() {
        const state = generarValorSeguro();
        const codeVerifier = generarValorSeguro();
        const codeChallenge = generarCodeChallenge(codeVerifier);
        pendingLogins.set(state, {
            codeVerifier,
            createdAt: Date.now(),
        });
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: "code",
            scope: "openid profile email",
            redirect_uri: redirectUri,
            state,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });
        return `${authorizationEndpoint}?${params.toString()}`;
    }
    async intercambiarCodigoPorTokens({ code, state }) {
        const loginData = pendingLogins.get(state);
        if (!loginData) {
            throw new Error("State inválido o expirado");
        }
        pendingLogins.delete(state);
        const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: clientId,
            code,
            redirect_uri: redirectUri,
            code_verifier: loginData.codeVerifier,
        });
        const response = await fetch(tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Error al intercambiar code por tokens:
${errorBody}`);
        }
        return response.json();
    }
}
export default new OAuthService();