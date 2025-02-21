const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String, required: true },
    places: {type: String, required: true },
});


userSchema.plugin(uniqueValidator);

// 첫 글자는 대문자로 
module.exports = mongoose.model('User', userSchema);