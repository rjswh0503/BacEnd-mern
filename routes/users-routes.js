const exrpess = require('express');
const { check } = require('express-validator');

const userController = require('../controller/users-controllers');
const userImg = require('../middleware/imgUpload/userImg');

const router = exrpess.Router();


router.get('/', userController.getUsers);


router.post('/signUp',
    userImg.single('image'),
    [
        check('name')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail() // test@test.com => test@test.com
            .isEmail(),
        check('password').isLength({ min: 6 })
    ],
    userController.signUp);



router.post('/login', userController.login);




module.exports = router;