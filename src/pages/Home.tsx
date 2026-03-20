import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import FloatingButton from "../components/FloatingButton"
import "../styles/app.css"
import { FiLogOut } from "react-icons/fi"
import Title from "../components/Title"
import { calculateStats, calculateRatingWithTrend } from "../lib/stats"
import StatDisplay from "../components/StatsDisplay"

export default function Home() {

    const [matches, setMatches] = useState<any[]>([])
    const navigate = useNavigate()

    const logout = async () => {
        await supabase.auth.signOut()
        navigate("/auth")
    }

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

    const { score, rating } = calculateStats(matches)
    const { trend } = calculateRatingWithTrend(matches)

    return (
        <div className="container">
            <Title />
            <div className="content-top">
                <div className="player-stats">

                    <div className="player-stat">
                        <p>Score</p>
                        <h2>
                            <StatDisplay value={score} />
                        </h2>
                    </div>

                    <div className="player-stat">
                        <p>Rating</p>
                        <h2>
                            <StatDisplay value={Number(rating)} />
                        </h2>
                        <div className="trend">
                            {trend > 0 && <span className="up">↑ +{trend.toFixed(1)}</span>}
                            {trend < 0 && <span className="down">↓ {trend.toFixed(1)}</span>}
                            {trend === 0 && <span className="same">—</span>}
                        </div>
                    </div>

                </div>

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

                    <div className="stat-card">
                        <h3>{totalGoals + totalAssists}</h3>
                        <p>G/A</p>
                    </div>

                    <div className="stat-card">
                        <h3>{totalMatches > 0 ? ((totalGoals + totalAssists) / totalMatches).toFixed(2) : 0}</h3>
                        <p>G/A per Match</p>
                    </div>

                </div>
            </div>

            <div className="content-middle">

                {lastMatch && (
                    <div className="card last-match">

                        <div className="last-match-header">
                            <span>Last Match</span>
                            <span className="match-date">{lastMatch.date}</span>
                        </div>

                        <div className="last-match-stats">
                            <div className="stat">
                                <span className="stat-value">{lastMatch.goals}</span>
                                <span className="stat-label">Goals</span>
                            </div>

                            <div className="divider"></div>

                            <div className="stat">
                                <span className="stat-value">{lastMatch.assists}</span>
                                <span className="stat-label">Assists</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
            <button className="logout-btn" onClick={logout}>
                <FiLogOut />
            </button>
            <FloatingButton onClick={() => navigate("/add")} />
        </div>
    )
}