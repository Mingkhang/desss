// Trang quản lý đại lý dành cho admin
import { useEffect, useState } from 'react';
import axios from '../../lib/axios';


interface Agent {
  _id: string;
  name: string;
  password?: string;
  balance: number;
  usedCredit: number;
  transactions: Array<{
    orderId: string;
    price: number;
    createdAt: string;
    status: string;
    username?: string;
    expiredAt?: string;
  }>;
}

const AdminAgentPage = () => {
  const [agents, setAgents] = useState<Agent[] | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', password: '', balance: 0 });
  const [depositAgentId, setDepositAgentId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [editBalanceAgentId, setEditBalanceAgentId] = useState<string | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState<number>(0);

  const reloadAgents = async () => {
    const res = await axios.get('/api/v1/admin/agents');
    setAgents(res.data.agents);
  };

  useEffect(() => {
    reloadAgents();
  }, []);

  // Thêm đại lý
  const handleAddAgent = async () => {
    await axios.post('/api/v1/admin/agents/add', newAgent);
    setShowAdd(false);
    setNewAgent({ name: '', password: '', balance: 0 });
    reloadAgents();
  };

  // Nạp tiền cho đại lý
  const handleDeposit = async () => {
    if (!depositAgentId) return;
    await axios.post(`/api/v1/admin/agents/${depositAgentId}/deposit`, { amount: depositAmount });
    setShowDeposit(false);
    setDepositAmount(0);
    setDepositAgentId(null);
    reloadAgents();
  };

  // Chỉnh sửa số dư đại lý
  const handleUpdateBalance = async (agentId: string, newBalance: number) => {
    await axios.put(`/api/v1/admin/agents/${agentId}/balance`, { balance: newBalance });
    reloadAgents();
  };

  return (
    <div>
      <h2>Quản lý đại lý</h2>
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => setShowAdd(true)}>Thêm đại lý</button>
      {showAdd && (
        <div className="bg-slate-800 p-4 rounded mb-4">
          <h3 className="mb-2">Thêm đại lý mới</h3>
          <input className="mr-2" type="text" placeholder="Tên đại lý" value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })} />
          <input className="mr-2" type="text" placeholder="Mật khẩu" value={newAgent.password} onChange={e => setNewAgent({ ...newAgent, password: e.target.value })} />
          <input className="mr-2" type="number" placeholder="Số dư ban đầu" value={newAgent.balance} onChange={e => setNewAgent({ ...newAgent, balance: Number(e.target.value) })} />
          <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleAddAgent}>Xác nhận</button>
          <button className="ml-2 bg-gray-500 text-white px-3 py-1 rounded" onClick={() => setShowAdd(false)}>Hủy</button>
        </div>
      )}
      <table className="w-full border border-white text-center" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th className="border border-white p-2">STT</th>
            <th className="border border-white p-2">Tên đại lý</th>
            <th className="border border-white p-2">Mật khẩu</th>
            <th className="border border-white p-2">Số tiền đã nạp</th>
            <th className="border border-white p-2">Số tiền đã sử dụng</th>
            <th className="border border-white p-2">Số tiền còn lại</th>
            <th className="border border-white p-2">Nạp tiền</th>
            <th className="border border-white p-2">Chỉnh sửa số dư</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(agents) ? agents : []).map((agent, idx) => (
            <tr key={agent._id}>
              <td className="border border-white p-2">{idx + 1}</td>
              <td className="border border-white p-2">{agent.name}</td>
              <td className="border border-white p-2">{agent.password || '-'}</td>
              <td className="border border-white p-2">{(agent.balance + agent.usedCredit).toLocaleString()}₫</td>
              <td className="border border-white p-2">{agent.usedCredit.toLocaleString()}₫</td>
              <td className="border border-white p-2">{agent.balance.toLocaleString()}₫</td>
              <td className="border border-white p-2">
                <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => { setDepositAgentId(agent._id); setShowDeposit(true); }}>Nạp tiền</button>
              </td>
              <td className="border border-white p-2">
                {editBalanceAgentId === agent._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editBalanceValue}
                      onChange={e => setEditBalanceValue(Number(e.target.value))}
                      className="w-24 text-center"
                    />
                    <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => { handleUpdateBalance(agent._id, editBalanceValue); setEditBalanceAgentId(null); }}>
                      Xác nhận
                    </button>
                    <button className="bg-gray-500 text-white px-2 py-1 rounded" onClick={() => setEditBalanceAgentId(null)}>
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => { setEditBalanceAgentId(agent._id); setEditBalanceValue(agent.balance + agent.usedCredit); }}>
                    Chỉnh sửa
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showDeposit && (
        <div className="bg-slate-800 p-4 rounded mt-4">
          <h3 className="mb-2">Nạp tiền cho đại lý</h3>
          <input className="mr-2" type="number" placeholder="Số tiền nạp" value={depositAmount} onChange={e => setDepositAmount(Number(e.target.value))} />
          <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleDeposit}>Xác nhận</button>
          <button className="ml-2 bg-gray-500 text-white px-3 py-1 rounded" onClick={() => setShowDeposit(false)}>Hủy</button>
        </div>
      )}
      <h3 className="mt-8 text-xl font-bold">Lịch sử giao dịch thành công</h3>
      {(Array.isArray(agents) ? agents : []).map(agent => (
        <div key={agent._id} className="mb-8">
          <h4 className="font-semibold">Đại lý: {agent.name}</h4>
          <table className="mb-4 border border-white w-full text-center" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="border border-white p-2">Mã đơn hàng</th>
                <th className="border border-white p-2">Số tiền</th>
                <th className="border border-white p-2">Tài khoản thuê</th>
                <th className="border border-white p-2">Thời gian thuê</th>
                <th className="border border-white p-2">Thời gian hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {agent.transactions.map(tx => (
                <tr key={tx.orderId}>
                  <td className="border border-white p-2">{tx.orderId}</td>
                  <td className="border border-white p-2 font-bold bg-slate-900 text-green-400">{tx.price.toLocaleString()}₫</td>
                  <td className="border border-white p-2">{tx.username || '-'}</td>
                  <td className="border border-white p-2">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="border border-white p-2">{tx.expiredAt ? new Date(tx.expiredAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default AdminAgentPage;
