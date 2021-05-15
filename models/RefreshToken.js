const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    token: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('RefreshToken', TokenSchema);