const { admin } = require("../config/firebaseAdmin");

const publicPaths = [
    '/',
    '/api/',
    '/api/public',
    '/api/public/productos',
    '/api/public/categorias',
    '/api/public/presentaciones',
    '/api/public/banners',
    '/api/public/quotes',
    '/api/analytics/quimicaindustrial/overview',
];

const authMiddleware = async (req, res, next) => {
    if (publicPaths.includes(req.originalUrl)) {
        return next();
    }

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        return res.status(401).json({ 
            message: "Unauthorized",
            error: "Missing or invalid authorization header"
        });
    }

    const idToken = authorizationHeader.split("Bearer ")[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        if (decodedToken.exp < Date.now() / 1000) {
            return res.status(401).json({ 
                message: "Unauthorized",
                error: "Token has expired"
            });
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ 
            message: "Unauthorized",
            error: error.message
        });
    }
};

module.exports = authMiddleware;