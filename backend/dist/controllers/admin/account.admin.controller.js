"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAccountStatus = exports.deleteAccount = exports.updateAccount = exports.getAllAccountsAdmin = exports.createAccount = void 0;
const account_model_1 = __importDefault(require("../../models/account.model"));
const apiError_1 = __importDefault(require("../../utils/apiError"));
const createAccount = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password)
        return next(new apiError_1.default(400, 'Username and password are required.'));
    try {
        const lastAccount = await account_model_1.default.findOne().sort({ displayOrder: -1 });
        const displayOrder = lastAccount ? lastAccount.displayOrder + 1 : 1;
        const newAccount = new account_model_1.default({ username, password, displayOrder });
        await newAccount.save();
        res.status(201).json({ success: true, data: newAccount });
    }
    catch (error) {
        next(error);
    }
};
exports.createAccount = createAccount;
const getAllAccountsAdmin = async (req, res, next) => {
    try {
        const accounts = await account_model_1.default.find().select('+password').sort({ displayOrder: 1 });
        res.status(200).json({ success: true, data: accounts });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllAccountsAdmin = getAllAccountsAdmin;
const updateAccount = async (req, res, next) => {
    try {
        const accountData = req.body;
        delete accountData.displayOrder; // Không cho phép cập nhật displayOrder thủ công
        delete accountData.status; // Không cho phép cập nhật status qua route này
        const updatedAccount = await account_model_1.default.findByIdAndUpdate(req.params.id, accountData, { new: true }).select('+password');
        if (!updatedAccount)
            return next(new apiError_1.default(404, 'Account not found'));
        res.status(200).json({ success: true, data: updatedAccount });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAccount = updateAccount;
const deleteAccount = async (req, res, next) => {
    try {
        const accountToDelete = await account_model_1.default.findByIdAndDelete(req.params.id);
        if (!accountToDelete)
            return next(new apiError_1.default(404, 'Account not found'));
        await account_model_1.default.updateMany({ displayOrder: { $gt: accountToDelete.displayOrder } }, { $inc: { displayOrder: -1 } });
        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAccount = deleteAccount;
// **HÀM MỚI CHO CHỨC NĂNG TẠM DỪNG / TIẾP TỤC**
const toggleAccountStatus = async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;
    // Chỉ cho phép thay đổi giữa 'available' và 'paused'
    if (status !== 'available' && status !== 'paused') {
        return next(new apiError_1.default(400, 'Trạng thái không hợp lệ.'));
    }
    try {
        const account = await account_model_1.default.findById(id);
        if (!account) {
            return next(new apiError_1.default(404, 'Account not found'));
        }
        account.status = status;
        await account.save();
        // Gửi tín hiệu cập nhật trạng thái đến tất cả client
        req.io.emit('account_updated', { accountId: account._id, newStatus: account.status });
        res.status(200).json({ success: true, data: account });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleAccountStatus = toggleAccountStatus;
