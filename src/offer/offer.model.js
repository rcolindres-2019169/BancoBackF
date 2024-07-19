import mongoose from "mongoose";
 
const offerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    user:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    date: {
        type: Date,
        default: Date.now,
        required: true
      }
    
 
}, {
    versionKey: false
})
 
export default mongoose.model('offer', offerSchema)