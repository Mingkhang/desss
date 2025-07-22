import { Request, Response } from 'express';
import Agent from '../../models/agent.model';

// Đăng nhập đại lý
export const agentLoginAndOrder = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const agent = await Agent.findOne({ name, password });
    if (!agent) {
      return res.status(401).json({ success: false, message: 'Sai tên hoặc mật khẩu đại lý' });
    }
    res.json({ success: true, agentId: agent._id, name: agent.name, balance: agent.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống', error });
  }
};