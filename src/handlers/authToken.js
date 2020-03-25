const returnModel = require('woo-utilities/returnModel');
const wooCrypto = require('woo-crypto');
const config = require('../../config');

const handler = (tokenType) => {
    return async (req, res, next) => {
        var token = req.headers.token;
        if (token) {
            var decrypted = wooCrypto.default.decrypt(token, config.publicKey, config.privateKey) || '';
            var decryptedJSON = JSON.parse(decrypted);

            decryptedJSON.type == tokenType && (wooUtil.default.date.getUTCTime() < decryptedJSON.expire || decryptedJSON.expire == "") ?
                next() :
                res.status(403).send(
                    returnModel({
                        status: false,
                        auth: false
                    })
                );
        } else {
            res.status(403).send(
                returnModel({
                    status: false,
                    auth: false
                })
            );
        }
    }
};

module.exports = handler;