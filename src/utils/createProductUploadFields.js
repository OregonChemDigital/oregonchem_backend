const SITES = ['site1', 'site2', 'site3', 'site4', 'site5'];

const createProductUploadFields = () => 
    SITES.map(site => ({
        name: `images[${site}]`,
        maxCount: 1
    }));

module.exports = createProductUploadFields;