export function formatMatchDate(date: string) {

    const matchDate = new Date(date)
    const now = new Date()

    // quitar horas para comparar limpio
    const diffTime = now.getTime() - matchDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // 🔥 menos de una semana → relativo
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d`

    // 🔥 formato dd/mm/aa
    return matchDate.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
    })
}