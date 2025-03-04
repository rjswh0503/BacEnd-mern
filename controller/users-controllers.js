const { validationResult } = require('express-validator');

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


const signUp = async (req, res, next) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        return next(new HttpError('유효하지 않은 입력 데이터를 전달했습니다. 데이터를 확인하세요.', 401)
        )
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
        const error = new HttpError('사용자가 이미 존재하니 로그인 해주세요.', 422);
        // 오류 발생시 next(error)를 사용하여 코드 실행을 중지함.
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://www.fitpetmall.com/wp-content/uploads/2022/11/shutterstock_196467692-1024x819.jpg',
        password,
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

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
}



const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('로그인 실패했으니, 나중에 다시 시도해주세요.', 500);

        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('유효하지 않은 자격 증명으로 인해 로그인 할 수 없습니다.', 401);
        return next(error)
    }





    res.json({
        message: '로그인 성공', user: existingUser.toObject({ getters: true })
    });
};



exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
