import { Routes, Route, useLocation } from "react-router-dom"
import ProtectedRoute from "../components/ProtectedRoute"

import Home from "../pages/Home"
import Add from "../pages/Add"
import Stats from "../pages/Stats"
import Auth from "../pages/Auth"
import Navbar from "../components/Navbar"
import Friends from "../pages/Friends"
import Verified from "../pages/Verified"
import "../styles/app.css"

export default function Layout() {

  const location = useLocation()

  const hideNavbar = location.pathname === "/auth"

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>

        <Route path="/verified" element={<Verified />} />

        <Route path="/auth" element={<Auth />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<Add />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/friends" element={<Friends />} />
        </Route>

      </Routes>
    </>
  )
}