import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const otpSchema = new mongoose.Schema(
    {
        identifier: {
            type: String,
            required: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        attempts: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => Date.now() + 5 * 60 * 1000, // 5 minutes
        },
    },
    {
        timestamps: true,
    }
);

// Hash OTP before saving
otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
});

// Compare OTP method
otpSchema.methods.compareOTP = async function (enteredOTP) {
    return await bcrypt.compare(enteredOTP, this.otp);
};

// Index to auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
