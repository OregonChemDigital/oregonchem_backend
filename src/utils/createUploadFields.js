const createUploadFields = (sites) => {
    return sites.map(site => ({
        name: `images[${site.name}]`,
        maxCount: 1
    }));
};

module.exports = createUploadFields;