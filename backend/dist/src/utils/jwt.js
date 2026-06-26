import crypto from "node:crypto";
const base64UrlEncode = (input) => {
    return Buffer.from(input)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
};
const base64UrlDecode = (input) => {
    const padded = input.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Buffer.from(padded + "=".repeat((4 - (padded.length % 4)) % 4), "base64");
    return buffer.toString("utf8");
};
export function signJwt(payload, secret, expiresInSeconds = 60 * 60 * 24 * 7) {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: payload.exp ?? now + expiresInSeconds,
    };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    return `${data}.${signature}`;
}
export function verifyJwt(token, secret) {
    const parts = token.split(".");
    if (parts.length !== 3) {
        throw new Error("Invalid token");
    }
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (header.alg !== "HS256") {
        throw new Error("Unsupported algorithm");
    }
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(data)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    const actual = Buffer.from(encodedSignature);
    const expected = Buffer.from(expectedSignature);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
        throw new Error("Invalid signature");
    }
    return payload;
}
