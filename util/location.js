const axios = require('axios');
const HttpError = require('../models/http-error');


const API_KEY = 'AIzaSyAo3RPwt8lO0tOg5Gh2gUnyOH6CTZGnE_k';

async function getCoordsForAddress(address) {
    
   // return {
    //    lat: 40.7484405,
    //    lng: -73.9856644
   //};
   const response = await axios.get(`
    https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
     address
    )}&key=${API_KEY}`
);

const data = response.data;

    if(!data || data.status === 'ZRO_RESULTS') {
        const error = new HttpError('입력한 주소의 장소를 찾지 못했습니다.', 404);
        throw error;
    };
    const coordinates = data.results[0].geometry.location;

    return coordinates;
} 

module.exports = getCoordsForAddress;
//  const getCoordsForAddress = () => {...} 
// async / await

// async를 사용할 때 await 사용해야 함