import StatsCharts from "../components/StatsCharts"
import Title from "../components/Title"
import MatchHistory from "../components/MatchHistory"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import UserInfo from "../components/UserInfo"

export default function Stats() {

    const [matches, setMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMatches()
    }, [])

    const handleDeleteMatch = (id: string) => {
        setMatches(prev => prev.filter(m => m.id !== id))
    }

    const handleUpdateMatch = (id: string, updated: any) => {
        setMatches(prev =>
            prev.map(m => m.id === id ? { ...m, ...updated } : m)
        )
    }

    const fetchMatches = async () => {

        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from("matches")
            .select(`
                id,
                date,
                goals,
                assists,
                goals_for,
                goals_against,
                rating,
                rating_version,
                pitch_id,
                pitches(name)
            `)
            .eq("user_id", user.id)
            .order("date", { ascending: false })

        // 🔥 pequeño delay para suavizar UX (clave)
        await new Promise(r => setTimeout(r, 250))

        if (!error && data) {
            setMatches(data)
        }

        setLoading(false)
    }

    // ⭐ BEST MATCH
    const bestMatch = matches
        .filter(m => m.rating)
        .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating
            return (b.goals + b.assists) - (a.goals + a.assists)
        })[0]

    // 🔥 BEST PITCH
    const pitchMap: Record<string, {
        total: number,
        count: number,
        goals: number,
        assists: number
    }> = {}

    matches.forEach(m => {
        if (!m.rating) return

        const name = m.pitches?.name || "Unknown"

        if (!pitchMap[name]) {
            pitchMap[name] = {
                total: 0,
                count: 0,
                goals: 0,
                assists: 0
            }
        }

        pitchMap[name].total += m.rating
        pitchMap[name].count++
        pitchMap[name].goals += m.goals
        pitchMap[name].assists += m.assists
    })

    const bestPitch = Object.entries(pitchMap)
        .map(([name, data]) => ({
            name,
            avg: data.total / data.count,
            goals: data.goals,
            assists: data.assists,
            contribution: data.goals + data.assists
        }))
        .sort((a, b) => b.avg - a.avg)[0]

    return (
        <div className="container">

            <Title />
            <UserInfo />

            {/* 🔴 LOADING STATE REAL */}
            {loading ? (
                <div className="skeleton-container fade-in">

                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>

                    <div className="skeleton-card large"></div>
                    <div className="skeleton-card large"></div>

                </div>
            ) : (
                <div className="fade-in">

                    <div className="insights">

                        {/* ⭐ BEST MATCH */}
                        {bestMatch && (
                            <div className="insight-card">
                                <p>Best Match</p>

                                <h3>
                                    ⚽ {bestMatch.goals} | 🎯 {bestMatch.assists}
                                </h3>

                                <span>Rating: {bestMatch.rating}</span>

                                <p>{bestMatch.pitches?.name}</p>
                                <p>{bestMatch.date}</p>
                            </div>
                        )}

                        {/* 🔥 BEST PITCH */}
                        {bestPitch && (
                            <div className="insight-card best">
                                <p>Best Pitch</p>

                                <h3>{bestPitch.name}</h3>

                                <div className="pitch-stats">
                                    <span>⚽ {bestPitch.goals}</span>
                                    <span>🎯 {bestPitch.assists}</span>
                                    <span>🔥 {bestPitch.contribution}</span>
                                </div>

                                <span>Average Rating: {bestPitch.avg.toFixed(1)}</span>
                            </div>
                        )}

                    </div>

                    <MatchHistory
                        matches={matches}
                        onDeleteMatch={handleDeleteMatch}
                        onUpdateMatch={handleUpdateMatch}
                    />

                    <StatsCharts data={matches} />

                </div>
            )}

        </div>
    )
}