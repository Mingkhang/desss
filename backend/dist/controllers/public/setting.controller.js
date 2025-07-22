"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicSettings = void 0;
const setting_model_1 = __importDefault(require("../../models/setting.model"));
const apiError_1 = __importDefault(require("../../utils/apiError"));
const getPublicSettings = async (req, res, next) => {
    try {
        const settings = await setting_model_1.default.findOne();
        if (!settings) {
            // Trả về lỗi nếu không tìm thấy cài đặt, thay vì trả về null
            return next(new apiError_1.default(404, 'Settings not found.'));
        }
        res.status(200).json({ success: true, data: settings });
    }
    catch (error) {
        next(error);
    }
};
exports.getPublicSettings = getPublicSettings;
