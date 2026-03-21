import { Link } from "react-router-dom"
import "../styles/navbar.css"
import { FaHome, FaPlus, FaChartBar, FaUsers } from "react-icons/fa"

export default function Navbar() {
    return (
        <div className="navbar">
            <Link to="/"><FaHome /></Link>
            <Link to="/add"><FaPlus /></Link>
            <Link to="/stats"><FaChartBar /></Link>
            <Link to="/friends"><FaUsers /></Link>
        </div>
    )
}