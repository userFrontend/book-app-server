const express = require('express');
router = express.Router();
const commentCtrl = require('../controller/commentCtrl');


router.post('/comment/:bookId', commentCtrl.add)
router.delete('/comment/:commentId', commentCtrl.delete)
router.put('/comment/:commentId', commentCtrl.update)

module.exports = router;

