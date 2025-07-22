import AgentLoginPage from './pages/agent/AgentLoginPage';
                <Route path="/agent/login" element={<AgentLoginPage />} />
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthProvider } from './contexts/AuthProvider';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAccountsPage from './pages/admin/AdminAccountsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminVouchersPage from './pages/admin/AdminVouchersPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminAgentPage from './pages/admin/AdminAgentPage';
import AgentDashboardPage from './pages/agent/AgentDashboardPage';

// THÊM MỚI: Import các trang mới sẽ được tạo
import RentalPage from './pages/RentalPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import AccountHistoryPage from './pages/AccountHistoryPage';


const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* THÊM MỚI: Các route cho luồng thanh toán */}
                <Route path="/rent/:accountId" element={<RentalPage />} />
                <Route path="/thanh-cong/:orderCode" element={<SuccessPage />} />
                <Route path="/don-huy/:orderCode" element={<CancelPage />} />
                <Route path="/account-history" element={<AccountHistoryPage />} />


                {/* Route cho dashboard đại lý */}
                <Route path="/agent/dashboard" element={<AgentDashboardPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/accounts" element={<AdminAccountsPage />} />
                        <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
                        <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
                        <Route path="/admin/settings" element={<AdminSettingsPage />} />
                        <Route path="/admin/agents" element={<AdminAgentPage />} />
                    </Route>
                </Route>
                
                {/* Route bắt lỗi 404 phải nằm cuối cùng */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}