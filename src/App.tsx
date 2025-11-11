import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Companies from "./pages/Companies";
import Configure from "./pages/Configure";
import History from "./pages/History";
import Profile from "./pages/Profile";
import AdminMasters from "./pages/AdminMasters";
import Resumes from "./pages/Resumes";
import ComingSoon from "./pages/ComingSoon";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

function ComingSoonWrapper() {
  const [searchParams] = useSearchParams();
  const featureName = searchParams.get('feature') || undefined;
  const description = searchParams.get('description') || undefined;
  return <ComingSoon featureName={featureName} description={description} />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <Layout>
                <Companies />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configure"
          element={
            <ProtectedRoute>
              <Layout>
                <Configure />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <History />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/masters"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminMasters />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <Layout>
                <Resumes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coming-soon"
          element={
            <ProtectedRoute>
              <Layout>
                <ComingSoonWrapper />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
