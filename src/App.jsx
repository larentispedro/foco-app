import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TimerProvider } from "./contexts/TimerContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Timer from "./pages/Timer";
import Agenda from "./pages/Agenda";
import Reports from "./pages/Reports";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";

export default function App() {
  return (
    // HashRouter (URLs tipo /#/tarefas) em vez de BrowserRouter: GitHub Pages
    // serve arquivo estático puro, sem reescrita de rota no servidor — uma
    // rota "real" tipo /tarefas daria 404 num F5. Hash nunca vai pro servidor.
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TimerProvider>
                  <Layout />
                </TimerProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tarefas" element={<Tasks />} />
            <Route path="timer" element={<Timer />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="projetos" element={<Projects />} />
            <Route path="config" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
