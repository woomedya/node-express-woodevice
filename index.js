const config = require('./config');
const authTokenHandler = require('woo-utilities/authTokenHandler');

const init = ({
    publicKey, privateKey, mongoose, iysContentFunc = null, keyInfoFunc = null
}) => {
    config.publicKey = publicKey;
    config.privateKey = privateKey;
    config.mongoose = mongoose;
    config.iysContentFunc = iysContentFunc;
    config.keyInfoFunc = keyInfoFunc;

    authTokenHandler.init({
        publicKey, privateKey
    });
}

module.exports = {
    init,
    router: {
        device: () => require('./src/routers/device')
    },
    repository: {
        device: () => require('./src/repositories/device')
    },
    model: {
        device: () => require('./src/repositories/models/device')
    }
}