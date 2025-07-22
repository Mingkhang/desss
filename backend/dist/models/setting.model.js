"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SettingSchema = new mongoose_1.Schema({
    paymentDescriptionCounter: { type: Number, default: 0 },
    bannerContent: {
        message: { type: String, default: 'Chào mừng đến với Thuetool.online!' },
        fontSize: { type: Number, default: 16 },
        isEnabled: { type: Boolean, default: true },
    },
    rentalPrices: {
        type: Map,
        of: new mongoose_1.Schema({
            duration: { type: Number, required: true },
            price: { type: Number, required: true },
        }),
        default: {
            '6h': { duration: 6, price: 16000 },
            '12h': { duration: 12, price: 22000 },
            '18h': { duration: 18, price: 20000 },
            '24h': { duration: 24, price: 32000 },
            '48h': { duration: 48, price: 40000 },
            '72h': { duration: 72, price: 72000 },
            '120h': { duration: 120, price: 70000 },
            '168h': { duration: 168, price: 102000 },
        },
    },
    monthlyRevenue: { type: Number, default: 0 },
}, { timestamps: true });
const Setting = mongoose_1.default.model('Setting', SettingSchema);
exports.default = Setting;
