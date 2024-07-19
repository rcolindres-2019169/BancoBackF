import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  fromAccount: {
    type: String,
    required: true
  },
  toAccount: {
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
  },
  comment: String,
  status: {
    type: String,
    enum: ['realizada', 'cancelada'],
    default: 'realizada'
  }
}, {
  versionKey: false
});

export default mongoose.model('Transfer', transferSchema);