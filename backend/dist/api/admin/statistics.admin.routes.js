"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statistics_admin_controller_1 = require("../../controllers/admin/statistics.admin.controller");
const router = (0, express_1.Router)();
router.get('/', statistics_admin_controller_1.getAdminStatistics);
exports.default = router;
