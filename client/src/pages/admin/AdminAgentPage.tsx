// Trang quản lý đại lý dành cho admin
import { useEffect, useState } from 'react';
import axios from 'axios';


interface Agent {
  _id: string;
  name: string;
  balance: number;
}

const AdminAgentPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    axios.get('/api/admin/agents').then(res => setAgents(res.data.agents));
  }, []);

  // Hàm chỉnh sửa số dư đại lý
  const handleUpdateBalance = async (agentId: string, newBalance: number) => {
    await axios.put(`/api/admin/agents/${agentId}/balance`, { balance: newBalance });
    // Reload lại danh sách
    const res = await axios.get('/api/admin/agents');
    setAgents(res.data.agents);
  };

  return (
    <div>
      <h2>Quản lý đại lý</h2>
      <table>
        <thead>
          <tr>
            <th>Tên đại lý</th>
            <th>Số dư</th>
            <th>Chỉnh sửa số dư</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(agent => (
            <tr key={agent._id}>
              <td>{agent.name}</td>
              <td>{agent.balance}</td>
              <td>
                <input
                  type="number"
                  defaultValue={agent.balance}
                  onBlur={e => handleUpdateBalance(agent._id, Number(e.target.value))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAgentPage;
