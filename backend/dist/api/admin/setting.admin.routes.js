"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setting_admin_controller_1 = require("../../controllers/admin/setting.admin.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.put('/', setting_admin_controller_1.updateSettings);
exports.default = router;
