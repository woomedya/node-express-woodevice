const returnModel = require('woo-utilities/returnModel');
const AsyncRouter = require('express-async-router').AsyncRouter;
const authToken = require('woo-utilities/authTokenHandler');
const herokuIP = require('woo-utilities/herokuIPHandler');
const token = require('../constants/token');
const deviceRepo = require('../repositories/device');
const config = require('../../config');
const dateValidate = require('woo-utilities/date').dateValidate;
const moment = require('moment');

const router = AsyncRouter();

var processDevices = {};

router.post('/insert', authToken.handler(token.DEVICE_INSERT), herokuIP.handler(), async (req, res) => {
    if (processDevices[req.body.device]) {
        return res.send(returnModel({
            data: null
        }));
    } else {
        processDevices[req.body.device] = true;
    }

    // req.body.device, req.body.keys, req.body.os
    var device = await deviceRepo.findByDevice(req.body.device);

    var iysContent = config.iysContentFunc ? await config.iysContentFunc({
        ip: req.ip,
        body: req.body,
        purchase: req.body.purchase,
    }) : null;

    // bazı işletim sistemlerinden os gelmemesi durumu için kullanılır.
    if (!req.body.os && (device ? device.os == null : true)) {
        req.body.os = req.body.device ? (req.body.device.indexOf("-") > 0 ? "ios" : "android") : null;
    }

    if (device) {
        var ips = device.ips || {};
        if (req.ip) {
            let timeKey = req.ip + ':' + moment().format('HH');

            Object.keys(ips).filter(x => x.indexOf(req.ip) == 0 && x != req.ip && x != timeKey).forEach(ip => {
                delete ips[ip];
            });
            ips[req.ip] = (ips[req.ip] || 0) + 1;
            ips[timeKey] = (ips[timeKey] || 0) + 1;
        }

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

        iysContent = config.iysContentFunc ? await config.iysContentFunc({
            ip: req.ip,
            ips,
            purchase: purchase
                .filter(x => keyInfo[x.key] && dateValidate(x.date, keyInfo[x.key].subscriptionPeriod)),
            body: req.body
        }) : null;

        deviceRepo.update(req.body.device, {
            ips,
            iysContent,
            purchase
        });
    } else {
        await deviceRepo.insert(req.body.device, {
            ips,
            os: req.body.os,
            iysContent
        });
    }

    delete processDevices[req.body.device];
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