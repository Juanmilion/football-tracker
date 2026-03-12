import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import "../styles/dashboard.css"
import AddMatch from "../components/AddMatch"
import StatsCharts from "../components/StatsCharts"

export default function Dashboard() {

    const [matches, setMatches] = useState<any[]>([])
    const [showForm, setShowForm] = useState(false)
    const [showCharts, setShowCharts] = useState(false)

    useEffect(() => {
        fetchMatches()
    }, [])

    const fetchMatches = async () => {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
            .from("matches")
            .select(`
            id,
            date,
            goals,
            assists,
            pitches(name)
        `)
            .eq("user_id", user.id)   // ← FILTRO IMPORTANTE
            .order("date", { ascending: false })

        if (!error && data) {
            setMatches(data)
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    const totalMatches = matches.length
    const totalGoals = matches.reduce((sum, m) => sum + m.goals, 0)
    const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0)

    const totalContribution = totalGoals + totalAssists

    const contributionPerMatch =
        totalMatches > 0
            ? (totalContribution / totalMatches).toFixed(2)
            : "0.00"

    return (

        <div className="dashboard">

            <header className="dashboard-header">

                <h1>⚽ Football Tracker</h1>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    Logout ↩
                </button>

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
                        <h3>{totalContribution}</h3>
                        <p>G/A</p>
                    </div>

                    <div className="stat-card">
                        <h3>{contributionPerMatch}</h3>
                        <p>Contribution / Match</p>
                    </div>

                </div>

            </header>

            <div className="dashboard-actions">

                <button
                    className="add-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Close Form" : "+ Add Match"}
                </button>

                <button
                    className="charts-btn"
                    onClick={() => setShowCharts(!showCharts)}
                >
                    {showCharts ? "Hide Analytics" : "📊 View Analytics"}
                </button>

            </div>

            {showForm && <AddMatch />}

            {showCharts && <StatsCharts />}

            <section className="match-history">

                <h2>Match History</h2>

                <table>

                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Pitch</th>
                            <th>G</th>
                            <th>A</th>
                        </tr>
                    </thead>

                    <tbody>

                        {matches.map((m) => (

                            <tr key={m.id}>

                                <td>{m.date}</td>
                                <td>{m.pitches?.name}</td>
                                <td>{m.goals}</td>
                                <td>{m.assists}</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </section>

        </div>
    )
}