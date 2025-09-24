const express = require('express');
const router = express.Router();
const AIProductController = require('../controllers/AIProductController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload, handleProductUploads } = require('../middlewares/productStorageMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET all AI products
router.get('/', AIProductController.getAllAIProducts);

// GET AI product by ID
router.get('/:id', AIProductController.getAIProductById);

// CREATE new AI product
router.post('/nuevo', upload.any(), handleProductUploads, AIProductController.createAIProduct);

// UPDATE AI product
router.put('/:id', upload.any(), handleProductUploads, AIProductController.updateAIProduct);

// DELETE AI product
router.delete('/:id', AIProductController.deleteAIProduct);

// TRIGGER AI image generation
router.post('/:id/generate', AIProductController.triggerAIGeneration);

// UPDATE AI generation status (webhook endpoint)
router.post('/:id/status', AIProductController.updateAIStatus);

module.exports = router;

