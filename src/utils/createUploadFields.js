const createUploadFields = (sites) => {
    return sites.map(site => ({
        name: site.name,
        maxCount: 1
    }));
};

module.exports = createUploadFields;