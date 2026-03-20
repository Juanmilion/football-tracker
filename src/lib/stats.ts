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