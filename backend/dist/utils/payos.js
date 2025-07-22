"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __importDefault(require("@payos/node"));
const env_1 = __importDefault(require("../config/env"));
const payOS = new node_1.default(env_1.default.payosClientId, env_1.default.payosApiKey, env_1.default.payosChecksumKey);
exports.default = payOS;
