class HttpError extends Error {
    constructor(message, errorCode){
        super(message);
        this.Code = errorCode

    }
}
module.exports = HttpError