"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("./env"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const setting_model_1 = __importDefault(require("../models/setting.model"));
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(env_1.default.mongodbUri);
        console.log('MongoDB Connected Successfully.');
        await createDefaultAdmin();
        await createDefaultSettings();
    }
    catch (error) {
        console.error('MongoDB Connection Failed:', error);
        process.exit(1);
    }
};
const createDefaultAdmin = async () => {
    try {
        const adminExists = await admin_model_1.default.findOne({ username: env_1.default.adminUsername });
        if (!adminExists) {
            console.log('Default admin not found, creating one...');
            const defaultAdmin = new admin_model_1.default({ username: env_1.default.adminUsername, password: env_1.default.adminPassword });
            await defaultAdmin.save();
            console.log('Default admin created successfully.');
        }
    }
    catch (error) {
        console.error('Error creating default admin:', error);
    }
};
const createDefaultSettings = async () => {
    try {
        const settingsExist = await setting_model_1.default.countDocuments();
        if (settingsExist === 0) {
            console.log('Default settings not found, creating one...');
            const defaultSettings = new setting_model_1.default();
            await defaultSettings.save();
            console.log('Default settings created successfully.');
        }
    }
    catch (error) {
        console.error('Error creating default settings:', error);
    }
};
exports.default = connectDB;
