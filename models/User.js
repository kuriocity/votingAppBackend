const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
    //,unique: true
  },
  password: {
    type: String,
    required: true
  },
  pollsCreated:
    [
      {
        type: Schema.Types.ObjectId,
        ref: 'Poll'
      }
    ]
  ,
  pollsVoted:
    [
      {
        type: Schema.Types.ObjectId,
        ref: 'Poll'
      }
    ]
  ,
  createdDate: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('User', UserSchema)


/*jwt.sign(user.name, user.email, encryptionkey / secret)
const login = async (req, res) => {
  ValidateBody(
    {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
    req.body,
    res,
  )
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.json({ status: false, message: 'User does not exists' })

  const { password } = req.body
  if (user.comparePassword(password)) return res.json({ status: false, message: 'Wrong credentials' })


  try {
    const accessToken = user.gener

    /////
    const accessToken = user.generateAuthToken()
    const refreshToken = user.generateRefreshToken()
    const saveToken = new RefreshToken({ token: refreshToken })
    await saveToken.save()
    return res.json({ accessToken, refreshToken })
  } catch (error) {
    return res.json({ status: false, message: error })
  }
}
*/