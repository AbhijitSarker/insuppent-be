import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_EXPIRES_IN } from '../utils/constants.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

export const register = async (userData) => {
    const { email } = userData;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    const user = await User.create(userData);
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    };
};

export const login = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid email or password');
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    };
};