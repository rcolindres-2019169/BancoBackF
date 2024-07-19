import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  versionKey: false
});

export default mongoose.model('Deposit', depositSchema);
