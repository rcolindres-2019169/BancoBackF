import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  dpi: {
    type: String,
    minLength: 13,
    maxLength: 13,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    minLength: 8,
    maxLength: 8,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    minLength: [8, 'Password must be 8 characters'],
    required: true
  },
  jobname: {
    type: String,
    required: true
  },
  income: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    uppercase: true,
    enum: ['ADMIN', 'USER'],
    required: true
  },
  imageUser: {
    type: [String]
  }

}, {
  versionKey: false

})

export default mongoose.model('User', userSchema)