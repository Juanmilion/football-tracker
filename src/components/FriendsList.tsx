import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import {
    calculateAverageRating,
    calculateScore
} from "../lib/stats"

export default function FriendsList() {

    const [friends, setFriends] = useState<any[]>([])
    const [stats, setStats] = useState<any>({})
    const [myStats, setMyStats] = useState<any>(null)
    const [selectedFriend, setSelectedFriend] = useState<any | null>(null)

    useEffect(() => {
        getUser()
    }, [])

    const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        const id = data.user?.id || null

        if (id) fetchFriends(id)
    }

    const fetchFriends = async (id: string) => {

        // 🔥 relaciones aceptadas
        const { data: relations } = await supabase
            .from("friends")
            .select("user_id, friend_id")
            .or(`user_id.eq.${id},friend_id.eq.${id}`)
            .eq("status", "accepted")

        if (!relations) return

        const friendIds = relations.map(r =>
            r.user_id === id ? r.friend_id : r.user_id
        )

        if (friendIds.length === 0) {
            setFriends([])
            return
        }

        // 🔥 usernames
        const { data: users } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", friendIds)

        const statsMap: any = {}

        // 🔥 calcular stats amigos
        for (const user of users || []) {

            const { data: matches } = await supabase
                .from("matches")
                .select("id, date, goals, assists")
                .eq("user_id", user.id)

            const goals = matches?.reduce((s, m) => s + m.goals, 0) || 0
            const assists = matches?.reduce((s, m) => s + m.assists, 0) || 0
            const totalMatches = matches?.length || 0

            statsMap[user.id] = {
                goals,
                assists,
                matches: totalMatches,
                rating: calculateAverageRating(matches || []),
                score: calculateScore(matches || []),
                gaPerMatch:
                    totalMatches > 0
                        ? ((goals + assists) / totalMatches).toFixed(2)
                        : "0.00"
            }
        }

        // 🔥 calcular MIS stats
        const { data: myMatches } = await supabase
            .from("matches")
            .select("id, date, goals, assists")
            .eq("user_id", id)

        const myGoals = myMatches?.reduce((s, m) => s + m.goals, 0) || 0
        const myAssists = myMatches?.reduce((s, m) => s + m.assists, 0) || 0
        const myMatchesCount = myMatches?.length || 0

        setMyStats({
            goals: myGoals,
            assists: myAssists,
            matches: myMatchesCount,
            rating: calculateAverageRating(myMatches || []),
            score: calculateScore(myMatches || []),
            gaPerMatch:
                myMatchesCount > 0
                    ? ((myGoals + myAssists) / myMatchesCount).toFixed(2)
                    : "0.00"
        })

        // 🔥 ordenar correctamente
        const sorted = (users || []).sort((a, b) =>
            (statsMap[b.id]?.score || 0) - (statsMap[a.id]?.score || 0)
        )

        setStats(statsMap)
        setFriends(sorted)
    }

    const topPlayerId = friends[0]?.id

    const getResult = (mine: number, theirs: number) => {
        if (mine > theirs) return { mine: "win", theirs: "lose" }
        if (mine < theirs) return { mine: "lose", theirs: "win" }
        return { mine: "draw", theirs: "draw" }
    }

    return (

        <div className="card-list">

            <h3>Friends</h3>

            {friends.length === 0 && (
                <p>No friends yet</p>
            )}

            {friends.map(f => (

                <div
                    key={f.id}
                    onClick={() =>
                        setSelectedFriend((prev: typeof selectedFriend) =>
                            prev?.id === f.id ? null : f
                        )
                    }
                    className={`friend-card ${f.id === topPlayerId ? "top-player" : ""}`}
                >

                    <div className="friend-header">
                        <h4>{f.username}</h4>

                        {f.id === topPlayerId && (
                            <span className="top-badge">🏆 TOP</span>
                        )}

                        <span className="friend-score">
                            🏆 {stats[f.id]?.score || 0}
                        </span>
                    </div>

                    <div className="friend-stats">
                        <span>⭐ {stats[f.id]?.rating || 0}</span>
                        <span>🎮 {stats[f.id]?.matches || 0}</span>
                        <span>⚽ {stats[f.id]?.goals || 0}</span>
                        <span>🔥 {stats[f.id]?.gaPerMatch || 0}</span>
                    </div>

                </div>

            ))}

            {/* 🔥 COMPARACIÓN */}
            {selectedFriend && myStats && stats[selectedFriend.id] && (

                <div className="comparison-card">

                    <h3>You VS {selectedFriend.username}</h3>

                    <div className="comparison-grid">

                        {/* SCORE */}
                        {(() => {
                            const r = getResult(
                                myStats.score,
                                stats[selectedFriend.id].score
                            )
                            return (
                                <div className="comparison-row">
                                    <span className={r.mine}> {myStats.score}</span>
                                    <span>🏆</span>
                                    <span className={r.theirs}>
                                        {stats[selectedFriend.id].score}
                                    </span>
                                </div>
                            )
                        })()}

                        {/* RATING */}
                        {(() => {
                            const r = getResult(
                                myStats.rating,
                                stats[selectedFriend.id].rating
                            )
                            return (
                                <div className="comparison-row">
                                    <span className={r.mine}>{myStats.rating}</span>
                                    <span>⭐</span>
                                    <span className={r.theirs}>
                                        {stats[selectedFriend.id].rating}
                                    </span>
                                </div>
                            )
                        })()}

                        {/* MATCHES */}
                        {(() => {
                            const r = getResult(
                                myStats.matches,
                                stats[selectedFriend.id].matches
                            )
                            return (
                                <div className="comparison-row">
                                    <span className={r.mine}>{myStats.matches}</span>
                                    <span>🎮</span>
                                    <span className={r.theirs}>
                                        {stats[selectedFriend.id].matches}
                                    </span>
                                </div>
                            )
                        })()}

                        {/* GOALS */}
                        {(() => {
                            const r = getResult(
                                myStats.goals,
                                stats[selectedFriend.id].goals
                            )
                            return (
                                <div className="comparison-row">
                                    <span className={r.mine}>{myStats.goals}</span>
                                    <span>⚽</span>
                                    <span className={r.theirs}>
                                        {stats[selectedFriend.id].goals}
                                    </span>
                                </div>
                            )
                        })()}

                        {/* G/A */}
                        {(() => {
                            const r = getResult(
                                Number(myStats.gaPerMatch),
                                Number(stats[selectedFriend.id].gaPerMatch)
                            )
                            return (
                                <div className="comparison-row">
                                    <span className={r.mine}>{myStats.gaPerMatch}</span>
                                    <span>🔥</span>
                                    <span className={r.theirs}>
                                        {stats[selectedFriend.id].gaPerMatch}
                                    </span>
                                </div>
                            )
                        })()}

                    </div>

                </div>
            )}

        </div>
    )
}