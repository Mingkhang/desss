"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicAccounts = void 0;
const account_model_1 = __importDefault(require("../../models/account.model"));
const getPublicAccounts = async (req, res, next) => {
    try {
        const accounts = await account_model_1.default.find().sort({ displayOrder: 1 });
        const publicAccounts = accounts.map(acc => {
            const { password, ...rest } = acc.toObject();
            return { ...rest, username: `Un******` };
        });
        res.status(200).json({ success: true, data: publicAccounts });
    }
    catch (error) {
        next(error);
    }
};
exports.getPublicAccounts = getPublicAccounts;
