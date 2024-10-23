const { auth } = require("../config/firebaseAdmin");

const authMiddleware = async (req, res, next) => {
    const publicPaths = [
        '/',
        '/api/',
        '/api/public',
        '/api/public/productos',
        '/api/public/categorias',
        '/api/public/presentaciones',
        '/api/public/banners',
        '/api/public/quotes'
    ];
    if (publicPaths.includes(req.originalUrl)) {
        return next();
    }

    console.log('Authorization Header:', req.headers.authorization);

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        console.log('No Bearer token found');
        return res.status(401).json({ error: "Unauthorized" });
    }
    const idToken = authorizationHeader.split("Bearer ")[1];
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        if (decodedToken.exp < Date.now() / 1000) {
            console.log('Token has expired');
            return res.status(401).json({ error: "Token has expired" });
        }
        console.log('Token verified successfully');
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Error verifying ID token:", error);
        return res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = authMiddleware;




