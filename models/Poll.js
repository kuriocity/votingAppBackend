const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const userSchema = new mongoose.Schema({
  usersVoted: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});
const pollSchema = new mongoose.Schema({
  voterCode: {
    type: String,
    required: true,
    unique: true
  },
  pollQuestion: {
    type: String,
    required: true,
  },
  pollCreator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  polls: [
    {
      name: {
        type: String,
        required: true,
        unique: true
      },
      votes: {
        type: Number,
        default: 0
      },
      usersVoted: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      ]
    }
  ],
  usersVoted: [
    [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  ],
  /*{
    type: Array,
    required: true
  }*/
  createdDate: {
    type: Date,
    required: true,
    default: Date.now
  }
})

module.exports = mongoose.model('Poll', pollSchema)
