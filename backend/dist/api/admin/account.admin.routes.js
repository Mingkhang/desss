"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_admin_controller_1 = require("../../controllers/admin/account.admin.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.route('/')
    .get(account_admin_controller_1.getAllAccountsAdmin)
    .post(account_admin_controller_1.createAccount);
router.route('/:id')
    .put(account_admin_controller_1.updateAccount)
    .delete(account_admin_controller_1.deleteAccount);
// **ROUTE MỚI CHO CHỨC NĂNG TẠM DỪNG / TIẾP TỤC**
router.put('/:id/status', account_admin_controller_1.toggleAccountStatus);
exports.default = router;
