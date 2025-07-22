"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNewVoucher = void 0;
const voucher_model_1 = __importDefault(require("../models/voucher.model"));
const generateNewVoucher = async () => {
    const random = Math.random() * 100;
    let discountAmount = 1000; // Default 1000 VND (50% chance, when random >= 50)
    if (random < 1) {
        discountAmount = 6000; // 1% chance
    }
    else if (random < 3) {
        discountAmount = 5000; // 2% chance (random from 1-2.99)
    }
    else if (random < 8) {
        discountAmount = 4000; // 5% chance (random from 3-7.99)
    }
    else if (random < 18) {
        discountAmount = 3000; // 10% chance (random from 8-17.99)
    }
    else if (random < 50) {
        discountAmount = 2000; // 32% chance (random from 18-49.99)
    }
    const randomChars = (length) => Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    const firstDigit = discountAmount / 1000;
    const twoRandomDigits = Math.floor(10 + Math.random() * 90);
    const code = `${randomChars(3)}${firstDigit}${twoRandomDigits}${randomChars(2)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const newVoucher = new voucher_model_1.default({ code, discountAmount, expiresAt });
    await newVoucher.save();
    console.log(`Generated new voucher: ${code} with amount ${discountAmount}`);
    return newVoucher;
};
exports.generateNewVoucher = generateNewVoucher;
