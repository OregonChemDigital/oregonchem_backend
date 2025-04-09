const { body, validationResult } = require('express-validator');

const validateQuote = [
  body('products').isArray().withMessage('Products must be an array'),
  body('products.*.id').isString().withMessage('Product ID must be a string'),
  body('products.*.name').isString().withMessage('Product name must be a string'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('products.*.unit').isString().withMessage('Unit must be a string'),
  body('client.name').isString().withMessage('Client name must be a string'),
  body('client.lastname').isString().withMessage('Client lastname must be a string'),
  body('client.email').isEmail().withMessage('Invalid email format'),
  body('client.phone').isString().withMessage('Phone must be a string'),
  body('client.company').optional().isString().withMessage('Company must be a string'),
  body('client.ruc').optional().isString().withMessage('RUC must be a string'),
  body('site.name').isString().withMessage('Site name must be a string'),
  body('site.address').isString().withMessage('Site address must be a string'),
  body('site.district').optional().isString().withMessage('District must be a string'),
  body('site.city').optional().isString().withMessage('City must be a string'),
  body('site.department').optional().isString().withMessage('Department must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateQuote
}; 