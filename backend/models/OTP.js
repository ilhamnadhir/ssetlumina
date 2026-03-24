import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Expiry time: 5 minutes (300 seconds)
    },
    attempts: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('OTP', otpSchema);
