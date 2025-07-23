import { Router } from "express"

const router = Router()

router.get("/test-webhook-url", (req, res) => {
  res.status(200).json({
    message: "Webhook URL test endpoint",
    webhookUrl: "/api/v1/payment/payos-webhook",
    fullUrl: `${req.protocol}://${req.get("host")}/api/v1/payment/payos-webhook`,
    serverTime: new Date().toISOString(),
  })
})

export default router
