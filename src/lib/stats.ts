export function calculateStats(matches: any[]) {

    if (matches.length === 0) {
        return { score: 0, rating: 0 }
    }

    let score = 0
    let totalContributions = 0

    matches.forEach(m => {
        score += (m.goals * 5) + (m.assists * 3)
        totalContributions += m.goals + m.assists
    })

    const cpm = totalContributions / matches.length

    // 🔥 ajuste realista para fútbol sala
    let rating = cpm * 1.7

    rating = Math.min(10, rating)

    return {
        score,
        rating: Number(rating.toFixed(1))
    }
}

export function calculateRatingWithTrend(matches: any[]) {

    if (matches.length === 0) {
        return { rating: 0, trend: 0 }
    }

    const calc = (list: any[]) => {
        let total = 0

        list.forEach(m => {
            total += m.goals + m.assists
        })

        const cpm = total / list.length
        return Math.min(10, cpm * 1.7)
    }

    const current = calc(matches)

    if (matches.length === 1) {
        return { rating: current, trend: 0 }
    }

    const previous = calc(matches.slice(1)) // sin último partido

    const trend = current - previous

    return {
        rating: Number(current.toFixed(1)),
        trend: Number(trend.toFixed(2))
    }
}