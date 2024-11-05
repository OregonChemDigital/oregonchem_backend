const createProductUploadFields = () => {
    return [
        { name: 'images[site1]', maxCount: 1 },
        { name: 'images[site2]', maxCount: 1 },
        { name: 'images[site3]', maxCount: 1 },
        { name: 'images[site4]', maxCount: 1 },
        { name: 'images[site5]', maxCount: 1 },
    ];
};

module.exports = createProductUploadFields;