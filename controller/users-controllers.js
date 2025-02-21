const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');


const HttpError = require('../models/http-error');
const User = require('../models/user');
const { create } = require('../models/place');

const DUMMY_USERS = [
    {
        id: 'u1',
        name: '신재헌',
        email: 'test@test.com',
        password: '153123'
    }

];

const getUsers = (req,res, next) => {
    res.json({ users: DUMMY_USERS });
}

const signUp = async (req,res,next) => {

    const error = validationResult(req);

    if(!error.isEmpty()){
        return next(new HttpError('유효하지 않은 입력 데이터를 전달했습니다. 데이터를 확인하세요.', 401)
    )}

    const { name, email, password, places } = req.body;

    //전역변수로 선언
    let existingUser;
    try {
        existingUser = await User.findOne({ email : email });
    } catch(err) {
        const error = new HttpError('가입에 실패했으니, 나중에 다시 시도해주세요.', 500);

        return next(error);
    }

    if(existingUser){
        const error = new HttpError('사용자가 이미 존재하니 로그인 해주세요.', 422);
        // 오류 발생시 next(error)를 사용하여 코드 실행을 중지함.
        return next(error);
    }
    
    const createdUser = new User({
        name,
        email,
        image: 'https://www.fitpetmall.com/wp-content/uploads/2022/11/shutterstock_196467692-1024x819.jpg',
        password,
        places
    });

    try {
        await createdUser.save();
    } catch( err ){
        const error = new HttpError(
            '회원가입을 실패했습니다. 다시 시도하세요.', 500
        );
        return next(error);
    }

    res.status(201).json({user : createdUser.toObject({ getters: true })});
}



const login = (req,res,next) => {
    const { email, password } = req.body;

const identifiedUser = DUMMY_USERS.find(u => u.email === email);
    if(!identifiedUser || identifiedUser.password !== password) {
        // Code 422 : 사용자 입력값이 유효하지 않을 때 사용되는 코드
        throw new HttpError('사용자를 식별할 수 없으니 자격 증명을 확인하세요.', 422);
    }

    res.json({message : '로그인~'});
};



exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
