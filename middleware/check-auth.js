const jwt = require('jsonwebtoken');

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.Authorization.split(' ')[1];
        if (!token) {
            throw new HttpError('인증에 실패했습니다.', 401);
        }
        //토큰 검증
       const decodedToken =  jwt.verify(token, 'superssecret_dont-share');
       req.userData = {userId: decodedToken.userId};
        next();
    } catch (err) {
        const error = new HttpError('인증에 실패했습니다.', 401);
        return next(error);
    }
}