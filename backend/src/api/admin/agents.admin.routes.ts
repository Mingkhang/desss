import { Router } from 'express';
import mongoose from 'mongoose';
const router = Router();

const agentSchema = new mongoose.Schema({
  name: String,
  password: String,
  balance: Number,
});
const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);

// Thêm đại lý mới
router.post('/add', async (req, res) => {
  const { name, password, balance } = req.body;
  if (!name || !password) return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
  const existed = await Agent.findOne({ name });
  if (existed) return res.status(400).json({ success: false, message: 'Tên đại lý đã tồn tại' });
  const agent = await Agent.create({ name, password, balance: balance || 0 });
  res.json({ success: true, agent });
});

// Nạp tiền cho đại lý, reset số tiền đã sử dụng về 0
router.post('/:id/deposit', async (req, res) => {
  const { amount } = req.body;
  if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
  const agent = await Agent.findById(req.params.id);
  if (!agent) return res.status(404).json({ success: false, message: 'Không tìm thấy đại lý' });
  agent.balance += amount;
  await agent.save();
  // Xóa hết các giao dịch đã sử dụng (reset về 0)
  const AgentTransaction = mongoose.models.AgentTransaction || require('../../models/agentTransaction.model').default;
  await AgentTransaction.deleteMany({ agentId: agent._id, status: 'PAID' });
  res.json({ success: true, agent });
});

// Lấy danh sách đại lý
// Lấy danh sách đại lý kèm thông tin tín dụng và lịch sử giao dịch
router.get('/', async (req, res) => {
  const agents = await Agent.find();
  // Lấy giao dịch cho từng đại lý
  const AgentTransaction = mongoose.models.AgentTransaction || require('../../models/agentTransaction.model').default;
  const agentsWithDetails = await Promise.all(agents.map(async agent => {
    // Lấy các giao dịch thành công
    const transactions = await AgentTransaction.find({ agentId: agent._id, status: 'PAID' }).sort({ createdAt: -1 });
    // Tính số tín dụng đã sử dụng
    const usedCredit = transactions.reduce((sum, tx) => sum + (tx.price || 0), 0);
    return {
      _id: agent._id,
      name: agent.name,
      balance: agent.balance,
      usedCredit,
      transactions,
    };
  }));
  res.json({ agents: agentsWithDetails });
});

// Sửa số dư đại lý
router.put('/:id/balance', async (req, res) => {
  const { balance } = req.body;
  const agent = await Agent.findByIdAndUpdate(req.params.id, { balance }, { new: true });
  res.json({ agent });
});

export default router;
