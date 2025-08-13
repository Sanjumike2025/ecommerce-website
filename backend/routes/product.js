const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..' ,'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: File upload only supports the following filetypes - ' + filetypes);
  },
});

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateToken, authorize(['admin']), upload.single('productImage'), productController.createProduct);
router.put('/:id', authenticateToken, authorize(['admin']), upload.single('productImage'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorize(['admin']), productController.deleteProduct);

module.exports = router;
