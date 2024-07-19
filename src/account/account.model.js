import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  totalBalance: {
    type: Number,
    required: true,
    default: 0 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
}, {
  versionKey: false
});

export default mongoose.model('Account', accountSchema);