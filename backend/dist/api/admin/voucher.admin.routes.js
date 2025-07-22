"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const voucher_admin_controller_1 = require("../../controllers/admin/voucher.admin.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.route('/')
    .get(voucher_admin_controller_1.getAllVouchers)
    .post(voucher_admin_controller_1.createVoucherByAdmin);
router.route('/:id')
    .delete(voucher_admin_controller_1.deleteVoucherByAdmin);
exports.default = router;
