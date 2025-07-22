"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
// THAY ĐỔI Ở ĐÂY: Đổi tên hàm import
const transaction_admin_controller_1 = require("../../controllers/admin/transaction.admin.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
// THAY ĐỔI Ở ĐÂY: Đổi tên hàm được gọi
router.get('/', transaction_admin_controller_1.getAllTransactions);
exports.default = router;
