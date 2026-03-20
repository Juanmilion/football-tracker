import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"

import Home from "./pages/Home"
import Add from "./pages/Add"
import Stats from "./pages/Stats"
import Auth from "./pages/Auth"
import Navbar from "./components/Navbar"

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* Pública */}
        <Route path="/auth" element={<Auth />} />

        {/* Privadas */}
        <Route element={<ProtectedRoute />}>

          <Route path="/" element={<Home />} />
          <Route path="/add" element={<Add />} />
          <Route path="/stats" element={<Stats />} />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}