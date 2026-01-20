import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    });
};

export const verifyToken = (token, isRefresh = false) => {
    try {
        const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};
