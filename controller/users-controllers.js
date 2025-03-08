const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
    let users;
    try {
        //                           password는 뺀 나머지는 보여주기
        users = await User.find({}, '-password');

    } catch (err) {
        const error = new HttpError('나중에 다시 시도해주세요', 500);
        return next(error);
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) })
};


// jwt 토큰 추가하기
const signUp = async (req, res, next) => {

    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(new HttpError('유효하지 않은 입력 데이터를 전달했습니다. 데이터를 확인하세요.', 401)
        );
    }
    const { name, email, password } = req.body;

    //전역변수로 선언
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('가입에 실패했습니다. 나중에 다시 시도해주세요.', 500);

        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('사용자가 이미 존재합니다. 확인해주세요.', 422);
        // 오류 발생시 next(error)를 사용하여 코드 실행을 중지함.
        return next(error);
    }

    let hashPassword;
    try {
        hashPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError('계정 생성에 실패했습니다. 다시 시도해 주세요.', 500)
        return next(error);
    }


    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashPassword,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            '회원가입을 실패했습니다. 다시 시도하세요.', 500
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email },
            'superssecret_dont-share', { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError('회원가입에 실패했습니다. 다시 시도해주세요.', 500);
        return next(error);
    }
    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};



const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('로그인 실패했으니, 나중에 다시 시도해주세요.', 500);

        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError('유효하지 않은 자격 증명으로 인해 로그인 할 수 없습니다.', 401);
        return next(error)
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('비밀번호가 틀렸습니다. 다시 시도해주세요.', 500);
        return next(error);
    }


    if (!isValidPassword) {
        const error = new HttpError('유효하지 않은 자격 증명으로 인해 로그인 할 수 없습니다.', 401);
        return next(error)
    }


    let token;
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email },
            'superssecret_dont-share', { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError('로그인 실패했습니다. 다시 시도해주세요.', 500);
        return next(error);
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    });
};



exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
