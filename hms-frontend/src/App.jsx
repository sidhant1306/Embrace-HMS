import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, setNotificationFns } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ScrollToTop from './components/ScrollToTop';

// Public pages
import HomePage from './pages/HomePage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/public/AboutPage';
import DepartmentsPage from './pages/public/DepartmentsPage';
import DoctorsPage from './pages/public/DoctorsPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientLabReports from './pages/patient/PatientLabReports';
import PatientBills from './pages/patient/PatientBills';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorTodayAppointments from './pages/doctor/DoctorTodayAppointments';
import DoctorConsultations from './pages/doctor/DoctorConsultations';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorLabOrders from './pages/doctor/DoctorLabOrders';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminBeds from './pages/admin/AdminBeds';
import { AdminPatients, AdminDoctors, AdminStaff, AdminReports } from './pages/admin/AdminOtherPages';
import AdminNotifications from './pages/admin/AdminNotifications';

// Receptionist pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import ReceptionistAdmissions from './pages/receptionist/ReceptionistAdmissions';
import ReceptionistPrescriptions from './pages/receptionist/ReceptionistPrescriptions';
import { ReceptionistAppointments, ReceptionistPatients, ReceptionistBilling } from './pages/receptionist/ReceptionistOtherPages';

// Pharmacist pages
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import PharmacistPending from './pages/pharmacist/PharmacistPending';
import PharmacistDispense from './pages/pharmacist/PharmacistDispense';
import PharmacistInventory from './pages/pharmacist/PharmacistInventory';

// Lab Tech pages
import LabDashboard from './pages/lab/LabDashboard';
import LabPending from './pages/lab/LabPending';
import { LabUpload, LabReports } from './pages/lab/LabOtherPages';

// Shared pages
import PatientLookup from './pages/PatientLookup';

function NotificationBridge() {
  const { refresh, clearLocal } = useNotifications();
  setNotificationFns(refresh, clearLocal);
  return null;
}

function App() {
  return (
    <Router>
      <NotificationProvider>
      <AuthProvider>
        <NotificationBridge />
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Inter', sans-serif",
              borderRadius: '16px',
              padding: '14px 20px',
              fontSize: '14px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            },
            success: {
              iconTheme: { primary: '#00a896', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/book-appointment" element={<BookAppointmentPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/:id" element={<DoctorsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<AboutPage />} />

          {/* ── Patient Dashboard ── */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/book-appointment" element={<BookAppointmentPage embed />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/lab-reports" element={<PatientLabReports />} />
            <Route path="/patient/bills" element={<PatientBills />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
          </Route>

          {/* ── Doctor Dashboard ── */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/today-appointments" element={<DoctorTodayAppointments />} />
            <Route path="/doctor/consultations" element={<DoctorConsultations />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
            <Route path="/doctor/lab-orders" element={<DoctorLabOrders />} />
            <Route path="/doctor/patient-lookup" element={<PatientLookup />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>

          {/* ── Admin Dashboard ── */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/beds" element={<AdminBeds />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/patient-lookup" element={<PatientLookup />} />
          </Route>

          {/* ── Receptionist Dashboard ── */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
            <Route path="/receptionist/book-appointment" element={<BookAppointmentPage embed />} />
            <Route path="/receptionist/appointments" element={<ReceptionistAppointments />} />
            <Route path="/receptionist/patients" element={<ReceptionistPatients />} />
            <Route path="/receptionist/billing" element={<ReceptionistBilling />} />
            <Route path="/receptionist/admissions" element={<ReceptionistAdmissions />} />
            <Route path="/receptionist/prescriptions" element={<ReceptionistPrescriptions />} />
            <Route path="/receptionist/patient-lookup" element={<PatientLookup />} />
          </Route>

          {/* ── Pharmacist Dashboard ── */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['PHARMACIST']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
            <Route path="/pharmacist/pending" element={<PharmacistPending />} />
            <Route path="/pharmacist/dispense" element={<PharmacistDispense />} />
            <Route path="/pharmacist/inventory" element={<PharmacistInventory />} />
            <Route path="/pharmacist/patient-lookup" element={<PatientLookup />} />
          </Route>

          {/* ── Lab Technician Dashboard ── */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['LAB_TECHNICIAN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/lab/dashboard" element={<LabDashboard />} />
            <Route path="/lab/pending" element={<LabPending />} />
            <Route path="/lab/upload" element={<LabUpload />} />
            <Route path="/lab/reports" element={<LabReports />} />
            <Route path="/lab/patient-lookup" element={<PatientLookup />} />
          </Route>

          {/* ── 404 Catch-All ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
