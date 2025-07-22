import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const getAgentBalance = async () => {
  const res = await axios.get(`${API_URL}/api/agent/balance`);
  return res.data.balance;
};

export const getAgentTransactions = async () => {
  const res = await axios.get(`${API_URL}/api/agent/orders`);
  return res.data.orders;
};
