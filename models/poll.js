const mongoose = require('mongoose')

const pollSchema = new mongoose.Schema({
  voterCode: {
    type: String,
    required: true,
    unique: true
  },
  polls: [
    {
      name: String,
      votes: {
        type: Number,
        default: 0
      }
    }
  ]
  /*{
    type: Array,
    required: true
  }*/
  ,
  createdDate: {
    type: Date,
    required: true,
    default: Date.now
  }
})

module.exports = mongoose.model('Poll', pollSchema)