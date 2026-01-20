export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validateMobile = (mobile) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(mobile);
};

export const validateUsername = (username) => {
    const re = /^[a-z0-9_]{3,20}$/;
    return re.test(username);
};

export const validatePassword = (password) => {
    return password.length >= 8;
};

export const getPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 'weak', color: 'red', label: 'Weak' };
    if (strength <= 4) return { level: 'medium', color: 'yellow', label: 'Medium' };
    return { level: 'strong', color: 'green', label: 'Strong' };
};

export const validateSignupForm = (data) => {
    const errors = {};

    if (!validateUsername(data.username)) {
        errors.username = 'Username must be 3-20 characters and contain only lowercase letters, numbers, and underscores';
    }

    if (!data.fullName || data.fullName.trim().length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!validateEmail(data.email)) {
        errors.email = 'Please provide a valid email';
    }

    if (!validateMobile(data.mobile)) {
        errors.mobile = 'Please provide a valid mobile number (10-15 digits)';
    }

    if (!data.dateOfBirth) {
        errors.dateOfBirth = 'Date of birth is required';
    }

    if (!validatePassword(data.password)) {
        errors.password = 'Password must be at least 8 characters';
    }

    return errors;
};

export const validateLoginForm = (data) => {
    const errors = {};

    if (!data.identifier || data.identifier.trim().length === 0) {
        errors.identifier = 'Username, email, or mobile is required';
    }

    if (!data.password || data.password.length === 0) {
        errors.password = 'Password is required';
    }

    return errors;
};
