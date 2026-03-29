import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import FloatingButton from "../components/FloatingButton"
import "../styles/app.css"
import { FiLogOut } from "react-icons/fi"
import Title from "../components/Title"
import StatDisplay from "../components/StatsDisplay"
import UserInfo from "../components/UserInfo"
import { formatMatchDate } from "../lib/date"
import { calculateScore } from "../lib/stats"

export default function Home() {

    const [matches, setMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // 🔥 NUEVO
    const [pendingRequests, setPendingRequests] = useState(0)
    const [showToast, setShowToast] = useState(false)

    const navigate = useNavigate()

    const logout = async () => {
        await supabase.auth.signOut()
        navigate("/auth")
    }

    useEffect(() => {
        fetchMatches()
        fetchPendingRequests()
    }, [])

    // ---------------- MATCHES ----------------

    const fetchMatches = async () => {

        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from("matches")
            .select(`date, goals, assists, rating`)
            .eq("user_id", user.id)
            .order("date", { ascending: false })

        await new Promise(r => setTimeout(r, 250))

        if (data) setMatches(data)

        setLoading(false)
    }

    // ---------------- 🔥 REQUESTS ----------------

    const fetchPendingRequests = async () => {

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { count } = await supabase
            .from("friends")
            .select("*", { count: "exact", head: true })
            .eq("friend_id", user.id)
            .eq("status", "pending")

        const total = count || 0

        setPendingRequests(total)

        // 🔥 solo mostrar si hay
        if (total > 0) {
            setShowToast(true)

            // auto hide
            setTimeout(() => {
                setShowToast(false)
            }, 3000)
        }
    }

    // ---------------- STATS ----------------

    const totalMatches = matches.length
    const totalGoals = matches.reduce((s, m) => s + m.goals, 0)
    const totalAssists = matches.reduce((s, m) => s + m.assists, 0)

    const lastMatch = matches[0]

    const ratedMatches = matches.filter(m => m.rating !== null && m.rating !== undefined)

    const rating = ratedMatches.length > 0
        ? Math.round(
            (ratedMatches.reduce((acc, m) => acc + m.rating, 0) / ratedMatches.length) * 10
        ) / 10
        : 0

    const lastMatchRating = lastMatch?.rating ?? "-"

    const score = calculateScore(matches)

    return (
        <div className="container">

            {/* 🔥 TOAST */}
            {showToast && (
                <div className="top-toast">

                    <div
                        className="top-toast-content"
                        onClick={() => navigate("/friends")}
                    >
                        {pendingRequests === 1
                            ? "⚽ You have 1 friend request"
                            : `⚽ You have ${pendingRequests} friend requests`}
                    </div>

                    <button
                        className="top-toast-close"
                        onClick={() => setShowToast(false)}
                    >
                        ✕
                    </button>

                </div>
            )}

            <Title />
            <UserInfo />

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
                            <StatDisplay value={rating} />
                        </h2>
                    </div>

                </div>

                <div className="stats">

                    <div className="stat-card">
                        <h3><StatDisplay value={totalMatches} /></h3>
                        <p>Matches</p>
                    </div>

                    <div className="stat-card">
                        <h3><StatDisplay value={totalGoals} /></h3>
                        <p>Goals</p>
                    </div>

                    <div className="stat-card">
                        <h3><StatDisplay value={totalAssists} /></h3>
                        <p>Assists</p>
                    </div>

                    <div className="stat-card">
                        <h3><StatDisplay value={totalGoals + totalAssists} /></h3>
                        <p>G/A</p>
                    </div>

                    <div className="stat-card">
                        <h3>
                            <StatDisplay value={totalMatches > 0 ? parseFloat(((totalGoals + totalAssists) / totalMatches).toFixed(2)) : 0} />
                        </h3>
                        <p>G/A per Match</p>
                    </div>

                </div>
            </div>

            <div className="content-middle">

                {loading ? (
                    <div className="card last-match skeleton-card fade-in" style={{ height: "120px" }} />
                ) : lastMatch ? (
                    <div className="card last-match fade-in">

                        <div className="last-match-header">
                            <span>Last Match</span>
                            <span className="match-date">{formatMatchDate(lastMatch.date)}</span>
                        </div>

                        <div className="last-match-stats">
                            <div className="stat">
                                <span className="stat-value">
                                    <StatDisplay value={lastMatch.goals} />
                                </span>
                                <span className="stat-label">Goals</span>
                            </div>

                            <div className="divider"></div>

                            <div className="stat">
                                <span className="stat-value">
                                    <StatDisplay value={lastMatch.assists} />
                                </span>
                                <span className="stat-label">Assists</span>
                            </div>

                            <div className="stat">
                                <span className="stat-value">
                                    {lastMatchRating !== "-" ? Number(lastMatchRating).toFixed(1) : "-"}
                                </span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>

                    </div>
                ) : null}

            </div>

            <button className="logout-btn" onClick={logout}>
                <FiLogOut />
            </button>

            <FloatingButton onClick={() => navigate("/add")} />
        </div>
    )
}