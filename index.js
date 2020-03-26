const config = require('./config');
const deviceRouter = require('./src/routers/device');
const deviceRepo = require('./src/repositories/device');
const deviceModel = require('./src/repositories/models/device');
const authTokenHandler = require('woo-utilities/authTokenHandler');

const init = ({
    publicKey, privateKey, mongoose, iysContentFunc = null
}) => {
    config.publicKey = publicKey;
    config.privateKey = privateKey;
    config.mongoose = mongoose;
    config.iysContentFunc = iysContentFunc;

    authTokenHandler.init({
        publicKey, privateKey
    });
}

module.exports = {
    init,
    router: {
        device: deviceRouter
    },
    repository: {
        device: deviceRepo
    },
    model: {
        device: deviceModel
    }
}