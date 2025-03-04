const exrpess = require('express');
const { check } = require('express-validator');


const placeControllers = require('../controller/places-controllers');
const placeImg = require('../middleware/imgUpload/placeImg');
const router = exrpess.Router();




router.get('/:pid', placeControllers.getPlacesById);


/* 
첫 번째 라우트는 /api/places 로 시작하는 모든 요청을 처리한다.



id 값을 찾기 위해서는 params를 사용해야 함
*/

router.get('/user/:uid', placeControllers.getPlacesByUserId);


// placeControllers에 있는 createPlace함수에 포인터

// check()를 /api/places/을 대상으로 하는 post 요청에 추가 
// title이 비어 있지(isEmpty)않도록(not) 확인(check())하는 미들웨어
router.post('/',
    placeImg.single('image'),
    [
    check('title')
        .not()
        .isEmpty(),
    check('description')
        .isLength({min: 5}),
    
    check('address')
        .not()
        .isEmpty()    
    ],
    // controller가 실행되기 전에 미들웨어가 실행된다. title이 비어있지 않으면 확인 후 controller가 실행
    placeControllers.createPlace);

router.patch('/:pid',
    [
        check('title')
        .not()
        .isEmpty(),
        check('description')
        .isLength({min: 5}),
        
    ],
    placeControllers.updatePlaceById);

router.delete('/:pid', placeControllers.deletePlace);

//places 파일에 있는 router를 내보냄
// 오로지지 내보내기만 하므로 app.js에서 불러와야 함
module.exports = router;