const validateSite = (req, res, next) => {
    const validSites = process.env.SITE_IDS.split(',');
    if (!req.body.site || !validSites.includes(req.body.site.id)) {
        return res.status(400).json({ error: 'Invalid site identifier' });
    }
    next();
};

module.exports = {
    validateSite
}; 