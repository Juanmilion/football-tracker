import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Title from "../components/Title"
import { supabase } from "../lib/supabase"


export default function Verified() {


    useEffect(() => {
        supabase.auth.signOut()
    }, [])

    const navigate = useNavigate()

    return (
        <div className="container">

            <Title />

            <h1>✅ Account verified</h1>

            <p style={{ marginTop: "10px", color: "#9e9e9e" }}>
                You can now open the app and log in.
            </p>

            <button
                className="btn btn-primary"
                style={{ marginTop: "20px" }}
                onClick={() => navigate("/auth")}
            >
                Go to login
            </button>
            <br /><br />

            <a href="/" className="btn btn-blue">
                Open app
            </a>

        </div>
    )
}