import { Route, Routes } from 'react-router-dom';
import { LayoutGroup } from 'framer-motion';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Poem from './pages/Poem';
import PublicShareLanding from './pages/PublicShareLanding';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <LayoutGroup>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/:journalId"
              element={
                <ProtectedRoute>
                  <Journal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal/:journalId/poem/:poemId"
              element={
                <ProtectedRoute>
                  <Poem />
                </ProtectedRoute>
              }
            />

            {/* Public share landing page */}
            <Route
              path="/shared/:shareToken"
              element={<PublicShareLanding />}
            />

            {/* Public view-only journal */}
            <Route
              path="/shared/:shareToken/book"
              element={<Journal />}
            />
          </Routes>
        </LayoutGroup>
      </main>
    </div>
  );
}
