"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voucher_controller_1 = require("../controllers/public/voucher.controller");
const router = (0, express_1.Router)();
router.post('/apply', voucher_controller_1.applyVoucher);
exports.default = router;
