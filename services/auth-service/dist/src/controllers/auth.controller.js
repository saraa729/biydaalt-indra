import * as authService from "../services/auth.service.js";
function handleError(res, error, fallbackMessage) {
    const message = error instanceof Error ? error.message : fallbackMessage;
    const status = message === "Invalid credentials"
        ? 401
        : message === "User is inactive"
            ? 403
            : message === "User not found or inactive"
                ? 401
                : message === "A user with this email already exists"
                    ? 409
                    : message === "JWT secret is not configured"
                        ? 500
                        : message.includes("required")
                            ? 400
                            : message.includes("missing")
                                ? 500
                                : 400;
    return res.status(status).json({ success: false, message });
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error(error);
        handleError(res, error, "Login failed");
    }
};
export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, avatarUrl } = req.body;
        const result = await authService.register({
            email,
            password,
            firstName,
            lastName,
            phone,
            avatarUrl,
        });
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        console.error(error);
        handleError(res, error, "Registration failed");
    }
};
export const verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const token = authHeader.split(' ')[1];
        const user = await authService.verifyToken(token);
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        console.error(error);
        handleError(res, error, "Token verification failed");
    }
};
