"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVoucherByAdmin = exports.createVoucherByAdmin = exports.getAllVouchers = void 0;
const voucher_model_1 = __importDefault(require("../../models/voucher.model"));
const apiError_1 = __importDefault(require("../../utils/apiError"));
const voucher_service_1 = require("../../services/voucher.service");
const getAllVouchers = async (req, res, next) => {
    try {
        const vouchers = await voucher_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: vouchers });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllVouchers = getAllVouchers;
const createVoucherByAdmin = async (req, res, next) => {
    try {
        const newVoucher = await (0, voucher_service_1.generateNewVoucher)();
        res.status(201).json({ success: true, data: newVoucher });
    }
    catch (error) {
        next(error);
    }
};
exports.createVoucherByAdmin = createVoucherByAdmin;
const deleteVoucherByAdmin = async (req, res, next) => {
    try {
        const voucher = await voucher_model_1.default.findByIdAndDelete(req.params.id);
        if (!voucher) {
            return next(new apiError_1.default(404, 'Voucher not found'));
        }
        res.status(200).json({ success: true, message: 'Voucher deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteVoucherByAdmin = deleteVoucherByAdmin;
