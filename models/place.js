const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// place Schema(모델)생성
const placeSchema = new Schema({
    title: { type: String, required : true },
    description: {type: String, required : true},
    imgae: {type: String, required : true},
    address: {type: String, required : true},
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    creator : { type : String, required: true }
});
//        보통 대문자로 시작하고 복수형으로 하지 않음, /   참조할 schema 
// model ('Place', placeSchema)
module.exports = mongoose.model('Place', placeSchema);