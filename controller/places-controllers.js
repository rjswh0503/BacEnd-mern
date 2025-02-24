
// uuid 고유 식별자 id 
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: '세상에서 가장 유명한 고층 빌딩 중 하나',
        location: {
            lat: 40.7484405,
            lng: -73.9856644

        },
        address: '20 W 34th St., New York, NY 10001 미국',
        creator: 'u1'
    }
]

const getPlacesById  = async (req,res,next) => {
    const placeId = req.params.pid // { pId : 'p1'}

    let place;

    try {
         place =  await Place.findById(placeId);

    } catch(err){
        const error = new HttpError(
            '오류가 발생했습니다. 장소를 찾을 수 없습니다.', 500
        );
        //error가 발생하면 정지 시켜줌 
        return next(error);
    }
    

   if(!place){              // constructor(message,            errorCode);
    const error =  new HttpError('해당 ID값에 대한 장소를 찾지 못했습니다.', 404);
     
    return next(error);
    // thorw를 할 때는 return을 쓰지 않아도 되지만, next(error)를 사용할 경우에는 앞에 return을 꼭 사용
   };
    res.json({ place : place.toObject( {getters: true }) });
    
};





//function getPlaceById() {...}
// const getPlaceById = function() {...}



const getPlacesByUserId = async (req,res, next) => {
    const userId = req.params.uid;

    let places;
    try {
        places = await Place.find({ creator : userId });
    } catch(err) {
        const error = new HttpError('오류가 발생했습니다. 유저를 찾을 수 없습니다.', 500);
        return next(error);
    };
    
    if(!places || places.length === 0 ){
       return next(
       new HttpError('사용자 ID와 일치하는 장소를 찾을 수 없습니다.', 404)
    );
    };
    res.json({ places : places.map(place => place.toObject( { getters: true } ) )})
};


const createPlace =  async (req, res, next) => {

  const erros =  validationResult(req);
  if(!erros.isEmpty()){
    console.log(erros);
   return next(new HttpError('유효하지 않은 입력 데이터를 전달했습니다. 데이터를 확인하세요.', 422));
  }

    const { title, description, address, creator } = req.body;

    let coordinates;    
    try {
     coordinates = await getCoordsForAddress(address);
    } catch (error) {
       return next(error);

    }
    
     
    // const title = req.body.title 과 같음..
    const createPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://i.namu.wiki/i/UdlHN4NBO9ma2-9zq4o1LOlNbzEcN14BprHeMxd1dZmp-C8j-7XKzrJiN0MEcl38bKlVDemPU7OjABFBNuCXlh4UTDnAZu_Qw8zWcx6TBc3zyXzr7V6rH4RXe_sR0TWYIJZqYa_L7BvrUq1EtMc2gOg--_6bllND_s5kcZ98fX8.webp',
        creator 
    });

    let user;

    try {
        user = await User.findById(creator);
    } catch(err){
        const error = new HttpError('장소를 생성하는데 실패했습니다. 잠시후 다시 시도해주세요.',500);
        return next(error);
    }

    if(!user){
        const error = new HttpError('ID에 해당하는 사용자를 찾을 수 없습니다.', 404);
        return next(error);
    }

    console.log(user);

    //save() 도 프로미스이다. 비동기식 작업 
    try {
    const sess  = await mongoose.startSession();
    sess.startTransaction();
    await createPlace.save( { session: sess })
    user.places.push(createPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
    } catch( err ){
        const error = new HttpError(
            '장소 생성에 실패했습니다. 다시 시도하세요.', 500
        );
        return next(error);
    }
    
    // 보통 새롭게 등록된 것이 있을 때 201번을 반환 
    res.status(201).json({place: createPlace})
}


const updatePlaceById = async (req, res, next) => {
    const erros =  validationResult(req);
    if(!erros.isEmpty()){
        console.log(erros);
        return next(new HttpError('유효하지 않은 입력 데이터를 전달했습니다. 데이터를 확인하세요.', 404)
    )}

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let update;
    try  {
        update = await Place.findById(placeId);

    } catch(err){
        const error = new HttpError('업데이트 하는데 실패했습니다. 다시 시도해 주세요.', 500);
        return next(error);
    }


    update.title = title;
    update.description = description;

    try {
        await update.save();
    } catch(err) {
        const error = new HttpError('장소를 업데이트 할 수 었습니다.', 500);
        return next(error);

    }

    res.status(200).json({update: update.toObject({getters: true})});

}

const deletePlace = async (req,res,next) => {
    const placeId = req.params.pid;
    
    let place; // 전역 변수인 place선언 
    // try {} 안에 const 상수로 선언을 하게 되면 다음 블럭에서 사용이 불가능 하기 때문에 
    // 전역 변수로 place를 선언함.
    try {
     place = await Place.findById(placeId);
    } catch (err) { 
        const error = new HttpError('오류가 발생했습니다. 장소를 삭제할 수 없습니다.', 500);
        return next(error);
    }

    try {
      await place.deleteOne({_id : "placeId"});
    } catch(err){
        const error = new HttpError('오류가 발생했습니다. 장소를 삭제할 수 없습니다.', 500);
        return next(error);
    };


    res.status(200).json({message : '성공적으로 삭제되었습니다.'});
}


exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
