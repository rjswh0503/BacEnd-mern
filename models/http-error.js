class HttpError extends Error {
    constructor(message, errorCode) {   
        super(message); // 메세지 속성 추가
        this.code = errorCode; // 코드 속성 추가

    }
}


module.exports = HttpError;