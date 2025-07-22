"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/test-webhook-url", (req, res) => {
    res.status(200).json({
        message: "Webhook URL test endpoint",
        webhookUrl: "/api/v1/payment/payos-webhook",
        fullUrl: `${req.protocol}://${req.get("host")}/api/v1/payment/payos-webhook`,
        serverTime: new Date().toISOString(),
    });
});
exports.default = router;
