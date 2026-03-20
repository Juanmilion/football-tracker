import StatsCharts from "../components/StatsCharts"
import Title from "../components/Title"
import MatchHistory from "../components/MatchHistory"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { calculateInsights, calculateAverageRating, getRecentPerformance } from "../lib/stats"

export default function Stats() {

    const [matches, setMatches] = useState<any[]>([])
    const insights = calculateInsights(matches)
    const recentPerformance = getRecentPerformance(matches)
    const averageRating = calculateAverageRating(matches)

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
            .eq("user_id", user.id)
            .order("date", { ascending: false })

        if (!error && data) {
            setMatches(data)
        }
    }

    const safeTrend = recentPerformance ? Math.max(-2, Math.min(2, recentPerformance.trend)) : 0

    return (
        <div className="container">
            <Title />

            {recentPerformance && (
                <div className="performance">

                    <div className="performance-header">
                        <h2>{recentPerformance.label}</h2>
                        <span className="safe-trend">
                            {safeTrend > 0 && `↑ +${safeTrend}`}
                            {safeTrend < 0 && `↓ ${safeTrend}`}
                            {safeTrend === 0 && "—"}
                        </span>
                    </div>

                    <div className="performance-main">
                        <div className="big-rating">
                            {recentPerformance.avg}
                        </div>
                    </div>

                </div>

            )}

            {insights && (

                <div className="insights">

                    <div className="insight-card">
                        <p>Best Match</p>
                        <h3>
                            ⚽ {insights.bestMatch.goals} | 🎯 {insights.bestMatch.assists}
                        </h3>
                        <span>Rating: {insights.bestMatch.rating}</span>
                        <p>{insights.bestMatch.pitches.name}</p>
                        <p>{insights.bestMatch.date}</p>
                    </div>

                    <div className="insight-card best">

                        <p>Best Pitch</p>

                        <h3>{insights.bestPitchContribution.name}</h3>

                        <div className="pitch-stats">
                            <span>⚽ {insights.bestPitchGoals.value}</span>
                            <span>🎯 {insights.bestPitchAssists.value}</span>
                            <span>🔥 {insights.bestPitchContribution.value}</span>
                        </div>

                    </div>

                </div>
            )}
            <MatchHistory matches={matches} />
            <StatsCharts data={matches} />


        </div>
    )
}