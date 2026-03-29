import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { calculateScore } from "../lib/stats"

export default function FriendsList() {

    const [userId, setUserId] = useState<string | null>(null)
    const [friends, setFriends] = useState<any[]>([])
    const [stats, setStats] = useState<any>({})
    const [myStats, setMyStats] = useState<any>(null)
    const [selectedFriend, setSelectedFriend] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getUser()
    }, [])

    const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        const id = data.user?.id || null

        setUserId(id) // 🔥 clave

        if (id) fetchFriends(id)
    }

    const calculateAvgRating = (matches: any[]) => {
        const rated = matches.filter(m => m.rating !== null && m.rating !== undefined)

        if (rated.length === 0) return 0

        return Math.round(
            (rated.reduce((acc, m) => acc + m.rating, 0) / rated.length) * 10
        ) / 10
    }

    const fetchFriends = async (id: string) => {

        setLoading(true)

        // 1. relaciones
        const { data: relations } = await supabase
            .from("friends")
            .select("user_id, friend_id")
            .or(`user_id.eq.${id},friend_id.eq.${id}`)
            .eq("status", "accepted")

        if (!relations) {
            setLoading(false)
            return
        }

        const friendIds = relations.map(r =>
            r.user_id === id ? r.friend_id : r.user_id
        )

        const allIds = [...friendIds, id]

        // 2. usuarios
        const { data: users } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", allIds)

        // 3. 🔥 UNA SOLA QUERY de matches
        const { data: allMatches } = await supabase
            .from("matches")
            .select("*")
            .in("user_id", allIds)

        // 4. agrupar matches por usuario
        const matchesByUser: Record<string, any[]> = {}

        allMatches?.forEach(m => {
            if (!matchesByUser[m.user_id]) {
                matchesByUser[m.user_id] = []
            }
            matchesByUser[m.user_id].push(m)
        })

        const statsMap: any = {}

        allIds.forEach(userId => {

            const userMatches = matchesByUser[userId] || []

            const goals = userMatches.reduce((s, m) => s + m.goals, 0)
            const assists = userMatches.reduce((s, m) => s + m.assists, 0)
            const totalMatches = userMatches.length

            const rating = calculateAvgRating(userMatches)
            const score = calculateScore(userMatches)

            statsMap[userId] = {
                goals,
                assists,
                matches: totalMatches,
                rating,
                score,
                gaPerMatch:
                    totalMatches > 0
                        ? ((goals + assists) / totalMatches).toFixed(2)
                        : "0.00"
            }
        })

        const me = { id, username: "You" }

        const allUsers = [
            ...(users?.filter(u => u.id !== id) || []),
            me
        ]

        const sorted = allUsers.sort((a, b) =>
            (statsMap[b.id]?.score || 0) - (statsMap[a.id]?.score || 0)
        )

        setMyStats(statsMap[id])

        // pequeño delay para suavidad visual
        await new Promise(r => setTimeout(r, 250))

        setStats(statsMap)
        setFriends(sorted)
        setLoading(false)
    }

    const topPlayerId = friends[0]?.id
    const myId = userId
    // const me = { id: myId, username: "You" }

    const getResult = (mine: number, theirs: number) => {
        if (mine > theirs) return { mine: "win", theirs: "lose" }
        if (mine < theirs) return { mine: "lose", theirs: "win" }
        return { mine: "draw", theirs: "draw" }
    }

    return (
        <div className="card-list">

            <h3>Friends</h3>

            {/* 🔥 LOADING */}
            {loading ? (
                <div className="skeleton-container">
                    <div className="skeleton-card small"></div>
                    <div className="skeleton-card small"></div>
                    <div className="skeleton-card small"></div>
                </div>
            ) : friends.length === 0 ? (
                <p>No friends yet</p>
            ) : (
                friends.map((f, index) => {

                    const isSelected = selectedFriend?.id === f.id
                    const friendStats = stats[f.id]

                    let myWins = 0
                    let theirWins = 0

                    const compare = (a: number, b: number) => {
                        if (a > b) myWins++
                        else if (a < b) theirWins++
                    }

                    if (isSelected && myStats && friendStats) {
                        compare(myStats.score, friendStats.score)
                        compare(myStats.rating, friendStats.rating)
                        compare(myStats.matches, friendStats.matches)
                        compare(myStats.goals, friendStats.goals)
                        compare(myStats.assists, friendStats.assists)
                        compare(Number(myStats.gaPerMatch), Number(friendStats.gaPerMatch))
                    }

                    const getPosition = (index: number) => {
                        if (index === 0) return ""
                        if (index === 1) return "🥈"
                        if (index === 2) return "🥉"
                        return `#${index + 1}`
                    }

                    return (
                        <div key={f.id} className="fade-in">

                            <div
                                onClick={() => {
                                    if (f.id === myId) return

                                    setSelectedFriend((prev: any) =>
                                        prev?.id === f.id ? null : f
                                    )
                                }}
                                className={`
                                    friend-card 
                                    ${f.id === topPlayerId ? "top-player" : ""}
                                    ${f.id === myId ? "me-player" : ""}
                                `}
                            >

                                <div className="friend-header">
                                    <h4>
                                        {index === 0 && (
                                            <span>🏆<span className="top-badge">TOP</span></span>
                                        )}
                                        {getPosition(index)} {f.id === myId ? "You" : f.username}
                                    </h4>

                                    <span className="friend-score">
                                        🏆 {friendStats?.score || 0}
                                    </span>
                                </div>

                                <div className="friend-stats">
                                    <span>⭐ {friendStats?.rating || 0}</span>
                                    <span>🎮 {friendStats?.matches || 0}</span>
                                    <span>⚽ {friendStats?.goals || 0}</span>
                                    <span>🔥 {friendStats?.gaPerMatch || 0}</span>
                                </div>

                            </div>

                            {isSelected && myStats && friendStats && (

                                <div className="comparison-card">

                                    <h3>You VS {f.id === myId ? "You" : f.username}</h3>
                                    <h4>({myWins} - {theirWins})</h4>

                                    <div className="comparison-grid">

                                        {[
                                            ["🏆", myStats.score, friendStats.score],
                                            ["⭐", myStats.rating, friendStats.rating],
                                            ["🎮", myStats.matches, friendStats.matches],
                                            ["⚽", myStats.goals, friendStats.goals],
                                            ["🎯", myStats.assists, friendStats.assists],
                                            ["🔥", Number(myStats.gaPerMatch), Number(friendStats.gaPerMatch)]
                                        ].map(([icon, mine, theirs], i) => {
                                            const r = getResult(mine as number, theirs as number)
                                            return (
                                                <div className="comparison-row" key={i}>
                                                    <span className={r.mine}>{mine}</span>
                                                    <span>{icon}</span>
                                                    <span className={r.theirs}>{theirs}</span>
                                                </div>
                                            )
                                        })}

                                    </div>

                                </div>
                            )}

                        </div>
                    )
                })
            )}

        </div>
    )
}