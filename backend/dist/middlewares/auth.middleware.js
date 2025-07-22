"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, env_1.default.jwtSecret);
            const admin = await admin_model_1.default.findById(decoded.id);
            if (!admin) {
                return next(new apiError_1.default(401, 'Not authorized, admin not found'));
            }
            req.admin = admin;
            next();
        }
        catch (error) {
            return next(new apiError_1.default(401, 'Not authorized, token failed'));
        }
    }
    if (!token) {
        return next(new apiError_1.default(401, 'Not authorized, no token'));
    }
};
exports.protect = protect;
