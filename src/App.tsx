import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Add from "./pages/Add"
import Stats from "./pages/Stats"
import Navbar from "./components/Navbar"
import Auth from "./pages/Auth"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />

        <Route path="/add" element={
          <ProtectedRoute>
            <Add />
          </ProtectedRoute>
        } />

        <Route path="/stats" element={
          <ProtectedRoute>
            <Stats />
          </ProtectedRoute>
        } />
      </Routes>

    </BrowserRouter>
  )
}