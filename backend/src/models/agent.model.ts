// Model đại lý
import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
});

export default mongoose.model('Agent', AgentSchema);
