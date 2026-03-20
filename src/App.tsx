import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Add from "./pages/Add"
import Stats from "./pages/Stats"
import Navbar from "./components/Navbar"

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<Add />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>

    </BrowserRouter>
  )
}