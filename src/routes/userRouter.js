const express = require('express');
router = express.Router();
const authCtrl = require('../controller/userCtrl');


router.post('/signup', authCtrl.signup)
router.post('/login', authCtrl.login)
router.get('/user', authCtrl.getAll)
router.get('/user/:userId', authCtrl.getOne)
router.post('/user/:userId', authCtrl.del)
router.put('/user/:userId', authCtrl.update)

module.exports = router;

