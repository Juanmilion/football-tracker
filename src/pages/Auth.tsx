import { useState } from "react";
import "../styles/auth.css";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Auth() {

    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const [isLogin, setIsLogin] = useState(true)

    const [confirmPassword, setConfirmPassword] = useState("")

    const navigate = useNavigate()

    // 🔐 REGISTER
    const signUp = async () => {

        setError(null)
        setSuccess(null)

        if (!email || !password || !username) {
            setError("Please fill in all fields")
            return
        }

        // comprobar username único
        const { data: existing } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .maybeSingle()

        if (existing) {
            setError("Username already taken")
            return
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            return
        }

        const user = data.user

        if (!user) {
            setError("Error creating user")
            return
        }


        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        // 🔥 guardar profile con email (clave)
        const { error: profileError } = await supabase
            .from("profiles")
            .insert({
                id: user.id,
                username,
                email
            })

        if (profileError) {
            setError("Error creating profile")
            return
        }

        setSuccess("Account created. You can now log in.")
        setIsLogin(true)
    }

    // 🔐 LOGIN CON USERNAME
    const signIn = async () => {

        setError(null)
        setSuccess(null)

        if (!username || !password) {
            setError("Please fill in all fields")
            return
        }

        // buscar email por username
        const { data, error: userError } = await supabase
            .from("profiles")
            .select("email")
            .eq("username", username)
            .single()

        if (userError || !data) {
            setError("User not found")
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
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

                {/* USERNAME */}
                <input
                    className="auth-input"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                {/* EMAIL solo en register */}
                {!isLogin && (
                    <input
                        className="auth-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                )}

                {/* PASSWORD */}
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

                {!isLogin && (
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                )}

                {success && (
                    <div className="auth-success">
                        {success}
                    </div>
                )}

                <div className="auth-buttons">

                    {isLogin ? (
                        <button
                            className="auth-btn-primary"
                            onClick={signIn}
                        >
                            Login
                        </button>
                    ) : (
                        <button
                            className="auth-btn-primary"
                            onClick={signUp}
                        >
                            Register
                        </button>
                    )}

                    <button
                        className="auth-btn-secondary"
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError(null)
                            setSuccess(null)
                        }}
                    >
                        {isLogin ? "Create account" : "Already have an account"}
                    </button>

                </div>

            </div>

        </div>
    );
}