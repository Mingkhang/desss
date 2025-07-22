"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setting_controller_1 = require("../controllers/public/setting.controller");
const router = (0, express_1.Router)();
// Route này sẽ gọi hàm getPublicSettings đã được import
router.get('/', setting_controller_1.getPublicSettings);
exports.default = router;
