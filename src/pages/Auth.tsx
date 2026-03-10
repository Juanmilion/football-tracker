import { useState } from "react";
import "../styles/Auth.css";
import { supabase } from "../lib/supabase";

export default function Auth() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signUp = async () => {
        await supabase.auth.signUp({
            email,
            password,
        });
    };

    const signIn = async () => {
        await supabase.auth.signInWithPassword({
            email,
            password,
        });
    };

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