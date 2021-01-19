const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout } = require('../controllers/Auth.controller');
/*
My Routes will be like : 
    Register : http://localhost:5000/auth/register
    LogIn    : http://localhost:5000/auth/login
    LogOut   : http://localhost:5000/auth/logout
    Refresh  : http://localhost:5000/auth/refresh-token
*/
/*
I disabled the repassword stuff on backend because a brilliant idea came to my mind right now,
which is : Why don't we do this on frontend??

and I've found a thing called joi ref lol 

*/

router.post('/register', register);

router.post('/login', login);

router.delete('/logout', logout);

router.post('/refresh-token', refreshToken);

module.exports = router;
