const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const ProductController = require('../controllers/ProductController');
const CategoryController = require('../controllers/CategoryController');
const PresentationController = require('../controllers/PresentationController');
const BannerController = require('../controllers/BannerController');
const QuoteController = require('../controllers/QuoteController'); // Import QuoteController

const { handleProductUploads, upload: productUpload } = require('../middlewares/productStorageMiddleware');
const { handleCategoryUploads, upload: categoryUpload } = require('../middlewares/categoryStorageMiddleware');
const { handlePresentationUploads, upload: presentationUpload } = require('../middlewares/presentationStorageMiddleware');
const { upload, handleBannerUploads } = require('../middlewares/bannerStorageMiddleware');
const createUploadFields = require('../utils/createUploadFields');
const createProductUploadFields = require('../utils/createProductUploadFields');

// Define your sites array here, adjust as necessary
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
router.post('/public/quotes', QuoteController.createQuote); // Link the createQuote function

// Authenticated Routes
router.use(authMiddleware);

// PRODUCTS
router.get('/productos', ProductController.getAllProducts);
router.get('/productos/:id/:site', ProductController.getProductByIdAndSite);
router.post('/productos/nuevo', productUpload.fields(createProductUploadFields()), handleProductUploads, ProductController.createProduct);
router.get('/search', ProductController.searchProducts);

// CATEGORIES
router.get('/categorias', CategoryController.getAllCategories);
router.post('/categorias/nueva', categoryUpload.fields(createUploadFields(sites)), handleCategoryUploads, CategoryController.addCategory);

// PRESENTATIONS
router.get('/presentaciones', PresentationController.getAllPresentations);
router.post('/presentaciones/nueva', presentationUpload.fields(createUploadFields(sites)), handlePresentationUploads, PresentationController.addPresentation);
router.delete('/presentaciones/:id', PresentationController.deletePresentation);

// BANNERS
router.get('/banners', BannerController.getAllBanners);
router.post('/banners/nuevo', upload.single('image'), handleBannerUploads, BannerController.addBanner);

module.exports = router;



