const crypto = require('crypto');

const ACCESS_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
const REFRESH_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');

console.table({ ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET });
