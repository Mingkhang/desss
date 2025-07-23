import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const getAgentBalance = async (agentId?: string) => {
  const res = await axios.get(`${API_URL}/api/agent/balance${agentId ? `?agentId=${agentId}` : ''}`);
  return res.data.balance;
};

export const getAgentTransactions = async (agentId?: string) => {
  const res = await axios.get(`${API_URL}/api/agent/orders${agentId ? `?agentId=${agentId}` : ''}`);
  return res.data.orders;
};
