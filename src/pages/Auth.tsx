import { useState } from "react";
import "../styles/auth.css";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {

    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate()

    const signUp = async () => {

        setError(null)
        setSuccess(null)

        if (!email || !password) {
            setError("Please fill in all fields")
            return
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(
                "Account created. Please check your email to confirm your account."
            )
        }
    }


    const signIn = async () => {

        setError(null)
        setSuccess(null)

        if (!email || !password) {
            setError("Please fill in all fields")
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            navigate("/")
        }
    }

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1 className="auth-title">
                    ⚽ Football Tracker
                </h1>

                <p className="auth-subtitle">
                    Track your goals, assists and matches
                </p>

                <input
                    className="auth-input"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="auth-success">
                        {success}
                    </div>
                )}

                <div className="auth-buttons">

                    <button
                        className="auth-btn-primary"
                        onClick={signIn}
                    >
                        Login
                    </button>

                    <button
                        className="auth-btn-secondary"
                        onClick={signUp}
                    >
                        Register
                    </button>

                </div>

            </div>

        </div>
    );
}