import mongoose from "mongoose";
const OtpSchema=new mongoose.Schema({
    email:{type:String,required:true,index:true,lowercase:true,trim:true},
    otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  lastSent: { type: Date, required: true },
  expiresAt: { type: Date, required: true }
},{timestamps:true});

OtpSchema.index({expiresAt:1},{expireAfterSeconds:0});

OtpSchema.index({email:1},{unique:true});

export default mongoose.model('Otp',OtpSchema);