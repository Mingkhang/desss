"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const apiError_1 = __importDefault(require("../../utils/apiError"));
const env_1 = __importDefault(require("../../config/env"));
const loginAdmin = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password)
        return next(new apiError_1.default(400, 'Please provide username and password'));
    try {
        const admin = await admin_model_1.default.findOne({ username }).select('+password');
        if (!admin)
            return next(new apiError_1.default(401, 'Invalid credentials'));
        const isMatch = await admin.comparePassword(password);
        if (!isMatch)
            return next(new apiError_1.default(401, 'Invalid credentials'));
        const token = jsonwebtoken_1.default.sign({ id: admin._id }, env_1.default.jwtSecret, { expiresIn: '1d' });
        res.status(200).json({ success: true, token });
    }
    catch (error) {
        next(error);
    }
};
exports.loginAdmin = loginAdmin;
