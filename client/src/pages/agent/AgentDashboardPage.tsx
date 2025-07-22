import { useEffect, useState } from 'react';
import { getAgentBalance, getAgentTransactions } from '../../services/agentService';


interface AgentTransaction {
  orderId: string;
  price: number;
  status: string;
  username?: string;
  password?: string;
  expiredAt?: string;
}

const AgentDashboardPage = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<AgentTransaction[]>([]);

  useEffect(() => {
    getAgentBalance().then(setBalance);
    getAgentTransactions().then(setTransactions);
  }, []);

  return (
    <div>
      <h2>Số dư còn lại: {balance} VNĐ</h2>
      <h3>Lịch sử giao dịch:</h3>
      <ul>
        {transactions.map(tx => (
          <li key={tx.orderId}>
            Đơn: {tx.orderId} | Số tiền: {tx.price} | Trạng thái: {tx.status} | Tài khoản: {tx.username} | Mật khẩu: {tx.password} | Hết hạn: {tx.expiredAt}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgentDashboardPage;
