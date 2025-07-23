import { Request, Response } from 'express';
import Agent from '../../models/agent.model';

// Đăng nhập đại lý
export const agentLoginAndOrder = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    // Loại bỏ khoảng trắng và không phân biệt hoa thường cho name
    const agent = await Agent.findOne({
  name: { $regex: `^${name.trim()}$`, $options: 'i' }
});
if (!agent || agent.password !== password) {
  return res.status(401).json({ success: false, message: 'Sai tên hoặc mật khẩu đại lý' });
}
    res.json({ success: true, agentId: agent._id, name: agent.name, balance: agent.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống', error });
  }
};