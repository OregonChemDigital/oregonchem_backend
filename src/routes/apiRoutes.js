const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const ProductController = require('../controllers/ProductController');
const CategoryController = require('../controllers/CategoryController');
const PresentationController = require('../controllers/PresentationController');
const BannerController = require('../controllers/BannerController');
const { handleProductUploads, upload: productUpload } = require('../middlewares/productStorageMiddleware');
const { handleCategoryUploads, upload: categoryUpload } = require('../middlewares/categoryStorageMiddleware');
const { handlePresentationUploads, upload: presentationUpload } = require('../middlewares/presentationStorageMiddleware');
const { handleBannerUploads, upload: bannerUpload } = require('../middlewares/bannerStorageMiddleware');

// Public Routes
router.get('/public/productos', ProductController.getAllProducts);
router.get('/public/categorias', CategoryController.getAllCategories);
router.get('/public/presentaciones', PresentationController.getAllPresentations);
router.get('/public/banners', BannerController.getAllBanners);

// Authenticated Routes
router.use(authMiddleware);

// PRODUCTS
router.get('/productos', ProductController.getAllProducts);
router.get('/productos/:id/:site', ProductController.getProductByIdAndSite);
router.post('/productos/nuevo', productUpload.fields(createUploadFields(sites)), handleProductUploads, ProductController.createProduct);
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
router.post('/banners/nuevo', bannerUpload.single('image'), handleBannerUploads, BannerController.addBanner);

module.exports = router;


