const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String, required: true },
    // 한 유저가 여러 개의 장소를 추가할 수 있게게 배열로 [{ type : mongoose.Types.ObjectId, required : true, ref: 'Place'}]
    // 해야 함
    places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }]
});


userSchema.plugin(uniqueValidator);

// 첫 글자는 대문자로 
module.exports = mongoose.model('User', userSchema);