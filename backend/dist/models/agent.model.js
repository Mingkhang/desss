"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Model đại lý
const mongoose_1 = __importDefault(require("mongoose"));
const AgentSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
});
exports.default = mongoose_1.default.model('Agent', AgentSchema);
