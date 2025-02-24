const mongoose = require('mongoose');
const user = require('./user');

const Schema = mongoose.Schema;

// place Schema(모델)생성
const placeSchema = new Schema({
    title: { type: String, required : true },
    description: {type: String, required : true},
    image: {type: String, required : true},
    address: {type: String, required : true},
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    // 장소 스키마와 유저 스키마 간의 연결을 설정할 수 있게 해주는 ref를 사용함
    creator : { type : mongoose.Types.ObjectId, required : true, ref: 'User'}
});
//        보통 대문자로 시작하고 복수형으로 하지 않음, /   참조할 schema 
// model ('Place', placeSchema)
module.exports = mongoose.model('Place', placeSchema);