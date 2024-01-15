const express = require('express');
router = express.Router();
const bookCtrl = require('../controller/bookCtrl');


router.post('/book', bookCtrl.add)
router.get('/book', bookCtrl.get)
router.get('/book/:bookId', bookCtrl.getOne)
router.get('/like/:bookId', bookCtrl.like)
router.get('/dislike/:bookId', bookCtrl.dislike)
router.delete('/book/:bookId', bookCtrl.delete)
router.put('/book/:bookId', bookCtrl.update)
router.get('/download/:bookId', bookCtrl.download)

module.exports = router;

 