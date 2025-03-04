const exrpess = require('express');
const { check } = require('express-validator');

const userController = require('../controller/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = exrpess.Router();


router.get('/', userController.getUsers);


router.post('/signUp',
    fileUpload.single('image'),
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