export function calculateMatchRating(goals: number, assists: number) {

    const contributions = goals + assists

    // 🔥 fórmula ajustada fútbol sala
    let rating = contributions * 1.8

    rating = Math.min(10, rating)

    return Number(rating.toFixed(1))
}

export function calculateAverageRating(matches: any[]) {

    if (matches.length === 0) return 0

    const total = matches.reduce((sum, m) => {
        return sum + calculateMatchRating(m.goals, m.assists)
    }, 0)

    return Number((total / matches.length).toFixed(1))
}

export function calculateScore(matches: any[]) {
    // const totalGoals = matches.reduce((sum, m) => sum + m.goals, 0)
    // const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0)
    // 🔢 SCORE (acumulativo)
    let score = 0

    matches.forEach(m => {
        score += (m.goals * 5) + (m.assists * 3)
    })

    return score
}

export function calculateInsights(matches: any[]) {

    if (matches.length === 0) {
        return null
    }

    let bestMatch = null
    let bestRating = -1

    type PitchStats = {
        goals: number
        assists: number
        contributions: number
    }

    const pitchStats: Record<string, PitchStats> = {}

    matches.forEach(m => {

        const contributions = m.goals + m.assists

        const rating = Math.min(10, contributions * 1.8)

        // 🥇 mejor partido
        if (rating > bestRating) {
            bestRating = rating
            bestMatch = { ...m, rating }
        }

        const pitch = m.pitches?.name || "Unknown"

        if (!pitchStats[pitch]) {
            pitchStats[pitch] = {
                goals: 0,
                assists: 0,
                contributions: 0
            }
        }

        pitchStats[pitch].goals += m.goals
        pitchStats[pitch].assists += m.assists
        pitchStats[pitch].contributions += contributions
    })

    const getTop = (key: keyof PitchStats) => {

        const sorted = Object.entries(pitchStats).sort(
            ([, a], [, b]) => b[key] - a[key]
        )

        if (!sorted[0]) return { name: "-", value: 0 }

        return {
            name: sorted[0][0],
            value: sorted[0][1][key]
        }
    }

    return {
        bestMatch,
        bestPitchGoals: getTop("goals"),
        bestPitchAssists: getTop("assists"),
        bestPitchContribution: getTop("contributions")
    }
}

export function getRecentPerformance(matches: any[]) {

    if (matches.length === 0) return null

    const calculateMatchRating = (g: number, a: number) => {
        return Math.min(10, (g + a) * 1.8)
    }

    // 🔥 últimos 3 partidos
    const recent = matches.slice(0, 3)

    const ratings = recent.map(m =>
        calculateMatchRating(m.goals, m.assists)
    )

    const avg =
        ratings.reduce((a, b) => a + b, 0) / ratings.length

    // 📈 tendencia simple (último vs anterior)
    let trend = 0
    if (ratings.length > 1) {
        trend = ratings[0] - ratings[1]
    }

    const getLabel = (r: number) => {
        if (r < 5) return "📉 Bad form"
        if (r < 7) return "😐 Average"
        if (r < 8.5) return "👍 Good form"
        return "🔥 On fire"
    }

    return {
        avg: Number(avg.toFixed(1)),
        trend: Number(trend.toFixed(1)),
        label: getLabel(avg)
    }
}
