import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import Departments from './pages/Departments';
import Publications from './pages/Publications';
import PublicationDetail from './pages/PublicationDetail';
import FacultyDirectory from './pages/FacultyDirectory';
import FacultyProfile from './pages/FacultyProfile';
import AdminDashboard from './pages/AdminDashboard';
import MyProfile from './pages/MyProfile';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Home />
              </>
            </ProtectedRoute>
          } />

          <Route path="/departments" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Departments />
              </>
            </ProtectedRoute>
          } />

          <Route path="/publications" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Publications />
              </>
            </ProtectedRoute>
          } />

          <Route path="/publications/:id" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <PublicationDetail />
              </>
            </ProtectedRoute>
          } />

          <Route path="/faculty" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <FacultyDirectory />
              </>
            </ProtectedRoute>
          } />

          <Route path="/faculty/:id" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <FacultyProfile />
              </>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <MyProfile />
              </>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <>
                <Navbar />
                <AdminDashboard />
              </>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
