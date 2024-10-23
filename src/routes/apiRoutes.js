const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const ProductController = require('../controllers/ProductController');
const CategoryController = require('../controllers/CategoryController');
const PresentationController = require('../controllers/PresentationController');
const BannerController = require('../controllers/BannerController');
const { createQuote } = require('../controllers/QuoteController');
const { upload, firebaseStorageMiddleware } = require('../middlewares/firebaseStorageMiddleware');

// Function to create upload fields
const createUploadFields = (sites) => {
    return sites.map((site) => ({ name: site, maxCount: 1 }));
};

const sites = ["site1", "site2", "site3", "site4", "site5"];

// Public Routes
router.get('/public/productos', ProductController.getAllProducts);
router.get('/public/categorias', CategoryController.getAllCategories);
router.get('/public/presentaciones', PresentationController.getAllPresentations);
router.get('/public/banners', BannerController.getAllBanners);

// Authenticated Routes (Protected by authMiddleware)
router.use(authMiddleware);

// PRODUCTS
router.get('/productos', ProductController.getAllProducts);
router.get('/productos/:id/:site', ProductController.getProductByIdAndSite);
router.post(
    '/productos/nuevo',
    upload.fields(createUploadFields(sites)),
    firebaseStorageMiddleware,
    ProductController.createProduct
);
router.get('/search', ProductController.searchProducts);

// CATEGORIES
router.get('/categorias', CategoryController.getAllCategories);
router.post(
    '/categorias/nueva',
    upload.fields(createUploadFields(sites)),
    firebaseStorageMiddleware,
    CategoryController.addCategory
);

// PRESENTATIONS
router.get('/presentaciones', PresentationController.getAllPresentations);
router.post(
    '/presentaciones/nueva',
    upload.fields(createUploadFields(sites)),
    firebaseStorageMiddleware,
    PresentationController.addPresentation
);
router.delete('/presentaciones/:id', PresentationController.deletePresentation);

// BANNERS
router.get('/banners', BannerController.getAllBanners);
router.post(
    '/banners/nuevo',
    upload.single('image'),
    firebaseStorageMiddleware,
    BannerController.addBanner
);

// QUOTES
router.post('/quotes', createQuote);

module.exports = router;

