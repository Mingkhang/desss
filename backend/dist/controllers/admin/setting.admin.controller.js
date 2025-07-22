"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = void 0;
const setting_model_1 = __importDefault(require("../../models/setting.model"));
const updateSettings = async (req, res, next) => {
    try {
        const updatedSettings = await setting_model_1.default.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        req.io.emit('settings_updated', updatedSettings);
        res.status(200).json({ success: true, data: updatedSettings });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSettings = updateSettings;
