import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Home from '@/pages/Home';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminBookings from '@/pages/admin/AdminBookings';
import AdminServices from '@/pages/admin/AdminServices';
import AdminVets from '@/pages/admin/AdminVets';
import AdminFinancial from '@/pages/admin/AdminFinancial';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminGallery from '@/pages/admin/AdminGallery';
import AdminFaq from '@/pages/admin/AdminFaq';
import AdminPetHistory from '@/pages/admin/AdminPetHistory';
import AdminMessages from '@/pages/admin/AdminMessages';
import AdminUsers from '@/pages/admin/AdminUsers';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ServiceDetails from '@/pages/ServiceDetails';
import ProtectedRoute from '@/components/ProtectedRoute';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/servicos/:id" element={<ServiceDetails />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Login />} />}>
        <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="agendamentos" element={<AdminBookings />} />
        <Route path="servicos" element={<AdminServices />} />
        <Route path="veterinarios" element={<AdminVets />} />
        <Route path="financeiro" element={<AdminFinancial />} />
        <Route path="depoimentos" element={<AdminTestimonials />} />
        <Route path="galeria" element={<AdminGallery />} />
        <Route path="faq" element={<AdminFaq />} />
        <Route path="historico-pets" element={<AdminPetHistory />} />
        <Route path="mensagens" element={<AdminMessages />} />
        <Route path="usuarios" element={<AdminUsers />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App