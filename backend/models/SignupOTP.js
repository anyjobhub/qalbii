import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const signupOTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        attempts: {
            type: Number,
            default: 0,
            max: 3,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
            default: null,
        },
        userData: {
            username: String,
            fullName: String,
            mobile: String,
            dateOfBirth: Date,
            password: String,
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
signupOTPSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
});

// Compare OTP method
signupOTPSchema.methods.compareOTP = async function (enteredOTP) {
    return await bcrypt.compare(enteredOTP, this.otp);
};

// Index to auto-delete expired OTPs
signupOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SignupOTP = mongoose.model('SignupOTP', signupOTPSchema);

export default SignupOTP;
