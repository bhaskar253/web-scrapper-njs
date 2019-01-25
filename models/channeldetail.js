const mongoose = require('mongoose')

const ChannelDetail = mongoose.model('ChannelDetail',{
    title: {
        type: String,
        required: true,
        minlength: 1,
    },
    subscribers: {
        type: String,
        required: true,
    },
    totalViews: {
        type: String,
        required: true,
    }
})

module.exports = {ChannelDetail}

