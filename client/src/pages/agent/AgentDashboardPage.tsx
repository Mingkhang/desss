import { useEffect, useState } from 'react';
import axios from '../../lib/axios';

interface AgentTransaction {
  orderId: string;
  price: number;
  status: string;
  username?: string;
  expiredAt?: string;
  createdAt?: string;
}

const AgentDashboardPage = () => {
  const [agentInfo, setAgentInfo] = useState<{ balance: number; usedCredit: number; name: string } | null>(null);
  const [transactions, setTransactions] = useState<AgentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const agentId = localStorage.getItem('agentId');
      if (!agentId) return setLoading(false);
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        // Lấy số dư
        const balanceRes = await axios.get(`${API_URL}/api/v1/agent/balance?agentId=${agentId}`);
        // Lấy lịch sử giao dịch
        const txRes = await axios.get(`${API_URL}/api/v1/agent/orders?agentId=${agentId}`);
        // Lấy tên đại lý từ localStorage
        const agentName = localStorage.getItem('agentName') || '';
        // Tính usedCredit
        const txs = txRes.data.orders || [];
        const usedCredit = txs.filter((tx: AgentTransaction) => tx.status === 'PAID').reduce((sum: number, tx: AgentTransaction) => sum + (tx.price || 0), 0);
        setAgentInfo({
          balance: balanceRes.data.balance || 0,
          usedCredit,
          name: agentName,
        });
        setTransactions(txs);
      } catch (err) {
        setAgentInfo(null);
        setTransactions([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-red-500">Đang tải...</div>;
  if (!agentInfo) return <div className="p-8 text-red-500">Không tìm thấy thông tin đại lý!</div>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-red-500">
      <h2 className="text-2xl font-bold mb-4">Thông tin đại lý</h2>
      <div className="mb-6 flex gap-8">
        <div className="bg-gray-900 p-4 rounded shadow-lg">
          <div className="mb-2">Tên đại lý: <span className="font-bold">{agentInfo.name}</span></div>
          <div className="mb-2">Số tiền đã nạp: <span className="font-bold">{(agentInfo.balance + agentInfo.usedCredit).toLocaleString()}₫</span></div>
          <div className="mb-2">Số tiền đã sử dụng: <span className="font-bold">{agentInfo.usedCredit.toLocaleString()}₫</span></div>
          <div>Số tiền còn lại: <span className="font-bold">{agentInfo.balance.toLocaleString()}₫</span></div>
        </div>
      </div>
      <h3 className="mt-8 text-xl font-bold">Lịch sử giao dịch thành công</h3>
      <table className="mb-4 border border-red-500 w-full text-center" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th className="border border-red-500 p-2">Mã đơn hàng</th>
            <th className="border border-red-500 p-2">Số tiền</th>
            <th className="border border-red-500 p-2">Tài khoản thuê</th>
            <th className="border border-red-500 p-2">Thời gian thuê</th>
            <th className="border border-red-500 p-2">Thời gian hết hạn</th>
          </tr>
        </thead>
        <tbody>
          {transactions.filter(tx => tx.status === 'PAID').map(tx => (
            <tr key={tx.orderId} className="text-red-500">
              <td className="border border-red-500 p-2 font-bold">{tx.orderId}</td>
              <td className="border border-red-500 p-2 font-bold">{tx.price.toLocaleString()}₫</td>
              <td className="border border-red-500 p-2 font-bold">{tx.username || '-'}</td>
              <td className="border border-red-500 p-2 font-bold">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}</td>
              <td className="border border-red-500 p-2 font-bold">{tx.expiredAt ? new Date(tx.expiredAt).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgentDashboardPage;