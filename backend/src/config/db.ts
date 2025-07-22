import mongoose from 'mongoose';
import config from './env';
import Admin from '../models/admin.model';
import Setting from '../models/setting.model';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB Connected Successfully.');
    await createDefaultAdmin();
    await createDefaultSettings();
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
    try {
        const adminExists = await Admin.findOne({ username: config.adminUsername });
        if (!adminExists) {
            console.log('Default admin not found, creating one...');
            const defaultAdmin = new Admin({ username: config.adminUsername, password: config.adminPassword });
            await defaultAdmin.save();
            console.log('Default admin created successfully.');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

const createDefaultSettings = async () => {
    try {
        const settingsExist = await Setting.countDocuments();
        if (settingsExist === 0) {
            console.log('Default settings not found, creating one...');
            const defaultSettings = new Setting();
            await defaultSettings.save();
            console.log('Default settings created successfully.');
        }
    } catch (error) {
        console.error('Error creating default settings:', error);
    }
};

export default connectDB;