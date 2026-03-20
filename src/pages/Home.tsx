import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import FloatingButton from "../components/FloatingButton"
import "../styles/dashboard.css"

export default function Home() {

    const [matches, setMatches] = useState<any[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        fetchMatches()
    }, [])

    const fetchMatches = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from("matches")
            .select(`date, goals, assists`)
            .eq("user_id", user.id)
            .order("date", { ascending: false })

        if (data) setMatches(data)
    }

    const totalMatches = matches.length
    const totalGoals = matches.reduce((s, m) => s + m.goals, 0)
    const totalAssists = matches.reduce((s, m) => s + m.assists, 0)

    const lastMatch = matches[0]

    return (
        <div className="container">

            <h1>⚽ Football Tracker</h1>

            <div className="stats">

                <div className="stat-card">
                    <h3>{totalMatches}</h3>
                    <p>Matches</p>
                </div>

                <div className="stat-card">
                    <h3>{totalGoals}</h3>
                    <p>Goals</p>
                </div>

                <div className="stat-card">
                    <h3>{totalAssists}</h3>
                    <p>Assists</p>
                </div>

            </div>

            {lastMatch && (
                <div className="match-card">
                    <h3>Last Match</h3>
                    <p>{lastMatch.date}</p>
                    <p>⚽ {lastMatch.goals} | 🎯 {lastMatch.assists}</p>
                </div>
            )}

            <FloatingButton onClick={() => navigate("/add")} />

        </div>
    )
}