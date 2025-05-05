const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const ProductController = require('../controllers/ProductController');
const CategoryController = require('../controllers/CategoryController');
const PresentationController = require('../controllers/PresentationController');
const BannerController = require('../controllers/BannerController');
const QuoteController = require('../controllers/QuoteController');

// Middleware
const { handleProductUploads, upload: productUpload } = require('../middlewares/productStorageMiddleware');
const { handleCategoryUploads, upload: categoryUpload } = require('../middlewares/categoryStorageMiddleware');
const { handlePresentationUploads, upload: presentationUpload } = require('../middlewares/presentationStorageMiddleware');
const { upload: bannerUpload, handleBannerUploads } = require('../middlewares/bannerStorageMiddleware');

// Utils
const createUploadFields = require('../utils/createUploadFields');
const createProductUploadFields = require('../utils/createProductUploadFields');

const sites = [
    { name: 'site1' },
    { name: 'site2' },
    { name: 'site3' },
    { name: 'site4' },
    { name: 'site5' }
];

// Public Routes
router.get('/public/productos', ProductController.getAllProducts);
router.get('/public/categorias', CategoryController.getAllCategories);
router.get('/public/presentaciones', PresentationController.getAllPresentations);
router.get('/public/banners', BannerController.getAllBanners);
router.post('/public/quotes', QuoteController.createQuote);

// Authenticated Routes
router.use(authMiddleware);

// Products
router.get('/productos', ProductController.getAllProducts);
router.get('/productos/:id/:site', ProductController.getProductByIdAndSite);
router.post('/productos/nuevo', productUpload.fields(createProductUploadFields()), handleProductUploads, ProductController.createProduct);
router.put('/productos/:id', productUpload.fields(createProductUploadFields()), handleProductUploads, ProductController.updateProduct);
router.get('/search', ProductController.searchProducts);

// Categories
router.get('/categorias', CategoryController.getAllCategories);
router.post('/categorias/nueva', categoryUpload.fields(createUploadFields(sites)), handleCategoryUploads, CategoryController.addCategory);

// Presentations
router.get('/presentaciones', PresentationController.getAllPresentations);
router.post('/presentaciones/nueva', presentationUpload.fields(createUploadFields(sites)), handlePresentationUploads, PresentationController.addPresentation);
router.delete('/presentaciones/:id', PresentationController.deletePresentation);

// Banners
router.get('/banners', BannerController.getAllBanners);
router.post('/banners/nuevo', bannerUpload.single('image'), handleBannerUploads, BannerController.addBanner);

// Analytics
router.use('/analytics', require('./analyticsRoutes'));

module.exports = router;