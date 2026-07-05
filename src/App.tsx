import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { ListadoPage } from "./pages/ListadoPage";
import { NuevaPQRPage } from "./pages/NuevaPQRPage";
import { DetallePage } from "./pages/DetallePage";
import { EstadisticasPage } from "./pages/EstadisticasPage";
import { UsuariosPage } from "./pages/UsuariosPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<ListadoPage />} />
            <Route path="/nueva" element={<NuevaPQRPage />} />
            <Route
              path="/pqr/:id"
              element={
                <ProtectedRoute>
                  <DetallePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/estadisticas"
              element={
                <ProtectedRoute>
                  <EstadisticasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute rolesPermitidos={["admin"]}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
