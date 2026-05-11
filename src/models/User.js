const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'user name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword

    next()
  } catch (err) {
    next(err)
  }
})

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate()

  if(!update.password) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    update.password = await bcrypt.hash(update.password, salt)
    next()
  } catch (error) {
    next(err)
  }})
module.exports = mongoose.model('User', userSchema)
