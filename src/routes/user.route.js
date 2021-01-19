const express = require('express');
const router = express.Router();
const { protected } = require('../controllers/User.controller');

router.get('/protected', protected);

module.exports = router;
