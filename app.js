const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// router 미들웨어가 되어 편하게 사용 가능
const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');


const app = express();

app.use(bodyParser.json());

app.use('/uploads/Users', express.static(path.join('uploads', 'Users')));
app.use('/uploads/Places', express.static(path.join('uploads', 'Places')));




// 클라이언트와 서버간의 연결을 하기 위해 사용하는 함수
// 모든 도메인에서 현재 서버로 요청을 보낼 수 있도록 허용함.
// '*' 는 모든 도메인에 접근이 가능함 .


// 이 설정을 하지 않으면 클라이언트에서 요청을 보내도 서버에서 허용을 하지 않았기 때문에 cors오류가 뜸
app.use((req,res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    //
    res.setHeader('Access-COntrol-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');
    // 클라이언트가 서버에 보낼 수 있는 HTTP 메서드를 정의한 것.
    // 클라이언트에게 GET, POST, PATCH, DELETE를 허용함
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

    // 도메인에서 현재 서버로 HTTP 메서드인 GET, POST, PATCH, DELETE을 허용할 수 있게 설정해주는 것.

    // 그리고 다음 미들웨어로 이동
    next();
})

app.use('/api/places', placesRoutes); // => /api/places/...
app.use('/api/users', userRoutes);

app.use((req, res, next) => {
    const error = new HttpError('라우트를 찾지 못했습니다.', 404);
    throw error;
});

/*
오류 처리 미들웨어 생성
앞의 미들웨어에서 오류가 있어야만 발동하는 함수이다.
모든 라우터에서 사용 가능

*/
app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || '알 수 없는 애러가 발생했습니다.!!' });
});




mongoose.connect('mongodb+srv://shin:153123@cluster0.ydxf4.mongodb.net/mern?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        app.listen(5000, (req, res) => {
            console.log('서버 실행중....')
        });
    })
    .catch((err) => {
        console.log(err);
    });
