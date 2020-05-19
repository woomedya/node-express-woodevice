const returnModel = require('woo-utilities/returnModel');
const AsyncRouter = require('express-async-router').AsyncRouter;
const authToken = require('woo-utilities/authTokenHandler');
const token = require('../constants/token');
const deviceRepo = require('../repositories/device');
const config = require('../../config');
const dateValidate = require('woo-utilities/date').dateValidate;

const router = AsyncRouter();

router.post('/insert', authToken.handler(token.DEVICE_INSERT), async (req, res) => {
    // req.body.device, req.body.keys, req.body.os
    var device = await deviceRepo.findByDevice(req.body.device);

    var iysContent = config.iysContentFunc ? await config.iysContentFunc(req.body.os, req.body.purchase) : null;

    // bazı işletim sistemlerinden os gelmemesi durumu için kullanılır.
    if (!req.body.os && (device ? device.os == null : true)) {
        req.body.os = req.body.device ? (req.body.device.indexOf("-") > 0 ? "ios" : "android") : null;
    }

    if (device) {
        var purchase = (device.purchase || []).map(x => x);

        var keyInfo = config.keyInfoFunc ? await config.keyInfoFunc(req.body.os) : {};

        if (req.body.purchase && req.body.purchase.length) {
            req.body.purchase.forEach(item => {
                var lastPurchase = purchase
                    .filter(x => x.key == item.key)
                    .sort((x, y) => x.date > y.date ? -1 : 1)[0];

                if (!purchase.some(x => x.date == item.date)
                    && keyInfo[item.key]
                    && (!lastPurchase || !dateValidate(lastPurchase.date, keyInfo[item.key].subscriptionPeriod))) {
                    purchase.push({
                        ...item,
                        serverDate: new Date()
                    });
                }
            });
        }

        iysContent = config.iysContentFunc ? await config.iysContentFunc(req.body.os, purchase
            .filter(x => keyInfo[x.key] && dateValidate(x.date, keyInfo[x.key].subscriptionPeriod))) : null;

        deviceRepo.update(req.body.device, {
            iysContent,
            purchase
        });
    } else {
        deviceRepo.insert(req.body.device, {
            os: req.body.os,
            iysContent
        });
    }

    res.send(returnModel({
        data: iysContent
    }));
});

router.post('/keyinfo', authToken.handler(token.DEVICE_KEY), async (req, res) => {
    var keyInfo = config.keyInfoFunc ? await config.keyInfoFunc(req.body.os) : {};

    res.send(returnModel({
        data: keyInfo
    }));
});

module.exports = router;