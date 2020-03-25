const mongoose = require('../../../config').mongoose;

const device = new mongoose.Schema({
    device: {
        type: String,
        index: true,
        required: true
    },
    os: {
        type: String
    },
    iysContent: {
        type: Object
    },
    date: {
        type: Date,
        default: () => {
            return new Date();
        }
    },
    createdDate: {
        type: Date,
        default: () => {
            return new Date();
        }
    },
    purchase: {
        type: Array,
        default: () => {
            return [];
        }
    }
});

module.exports = mongoose.device.model('device', device, 'WooDevice');
