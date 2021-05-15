const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const VoteSchema = new Schema(
    {
        pollCreator: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        pollVoter: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        poll: {
            type: Schema.Types.ObjectId,
            ref: 'Poll'
        }
    }
)


module.exports = mongoose.model('Votes', VoteSchema)
