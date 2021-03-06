const deviceModel = require('./models/device');

const findByDevice = async (device) => {
    return await deviceModel.findOne({
        device: device
    }).exec();
}

const insert = async (device, data) => {
    return await deviceModel.create({
        device,
        os: data.os,
        iysContent: data.iysContent,
        ips: data.ips
    });
}

const update = async (device, data) => {
    var updatedData = { date: new Date() };

    if (data.iysContent)
        updatedData.iysContent = data.iysContent;

    if (data.purchase)
        updatedData.purchase = data.purchase;

    if (data.ips)
        updatedData.ips = data.ips;

    return await deviceModel.updateOne({
        device
    }, {
        $set: updatedData
    }).exec();
}

module.exports = {
    findByDevice,
    insert,
    update
}