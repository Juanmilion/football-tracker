import { Link } from "react-router-dom"
import "../styles/navbar.css"

export default function Navbar() {
    return (
        <div className="navbar">
            <Link to="/">🏠</Link>
            <Link to="/add">➕</Link>
            <Link to="/stats">📊</Link>
        </div>
    )
}