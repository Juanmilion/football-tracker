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

        const { data: relations } = await supabase
            .from("friends")
            .select("user_id, friend_id")
            .or(`user_id.eq.${id},friend_id.eq.${id}`)
            .eq("status", "accepted")

        if (!relations) return

        const friendIds = relations.map(r =>
            r.user_id === id ? r.friend_id : r.user_id
        )

        const { data: users } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", friendIds)

        const statsMap: any = {}

        // 🔥 stats amigos
        for (const user of users || []) {
            const { data: matches } = await supabase
                .from("matches")
                .select("*")
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

        // 🔥 MIS stats
        const { data: myMatches } = await supabase
            .from("matches")
            .select("*")
            .eq("user_id", id)

        const myGoals = myMatches?.reduce((s, m) => s + m.goals, 0) || 0
        const myAssists = myMatches?.reduce((s, m) => s + m.assists, 0) || 0
        const myMatchesCount = myMatches?.length || 0

        const myStatsObj = {
            id,
            goals: myGoals,
            assists: myAssists,
            matches: myMatchesCount,
            rating: calculateAverageRating(myMatches || []),
            score: calculateScore(myMatches || []),
            gaPerMatch:
                myMatchesCount > 0
                    ? ((myGoals + myAssists) / myMatchesCount).toFixed(2)
                    : "0.00"
        }

        setMyStats(myStatsObj)

        // 🔥 meterme en stats
        statsMap[id] = myStatsObj

        // 🔥 añadirme a lista
        const me = { id, username: "You" }
        const allUsers = [...(users || []), me]

        // 🔥 ordenar ranking
        const sorted = allUsers.sort((a, b) =>
            (statsMap[b.id]?.score || 0) - (statsMap[a.id]?.score || 0)
        )

        setStats(statsMap)
        setFriends(sorted)
    }

    const topPlayerId = friends[0]?.id
    const myId = myStats?.id

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

            {friends.map((f, index) => {

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
                    <div key={f.id}>

                        <div
                            onClick={() =>
                                setSelectedFriend((prev: any | null) =>
                                    prev?.id === f.id ? null : f
                                )
                            }
                            className={`
                friend-card 
                ${f.id === topPlayerId ? "top-player" : ""}
                ${f.id === myId ? "me-player" : ""}
              `}
                        >

                            <div className="friend-header">
                                <h4>
                                    {index === 0 && <span>🏆<span className="top-badge">TOP</span></span>} {getPosition(index)} {f.id === myId ? "You" : f.username}
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

                                    {(() => {
                                        const r = getResult(myStats.score, friendStats.score)
                                        return (
                                            <div className="comparison-row">
                                                <span className={r.mine}>{myStats.score}</span>
                                                <span>🏆</span>
                                                <span className={r.theirs}>{friendStats.score}</span>
                                            </div>
                                        )
                                    })()}

                                    {(() => {
                                        const r = getResult(myStats.rating, friendStats.rating)
                                        return (
                                            <div className="comparison-row">
                                                <span className={r.mine}>{myStats.rating}</span>
                                                <span>⭐</span>
                                                <span className={r.theirs}>{friendStats.rating}</span>
                                            </div>
                                        )
                                    })()}

                                    {(() => {
                                        const r = getResult(myStats.matches, friendStats.matches)
                                        return (
                                            <div className="comparison-row">
                                                <span className={r.mine}>{myStats.matches}</span>
                                                <span>🎮</span>
                                                <span className={r.theirs}>{friendStats.matches}</span>
                                            </div>
                                        )
                                    })()}

                                    {(() => {
                                        const r = getResult(myStats.goals, friendStats.goals)
                                        return (
                                            <div className="comparison-row">
                                                <span className={r.mine}>{myStats.goals}</span>
                                                <span>⚽</span>
                                                <span className={r.theirs}>{friendStats.goals}</span>
                                            </div>
                                        )
                                    })()}

                                    {(() => {
                                        const r = getResult(myStats.assists, friendStats.assists)
                                        return (
                                            <div className="comparison-row">
                                                <span className={r.mine}>{myStats.assists}</span>
                                                <span>🎯</span>
                                                <span className={r.theirs}>{friendStats.assists}</span>
                                            </div>
                                        )
                                    })()}

                                    {(() => {
                                        const r = getResult(
                                            Number(myStats.gaPerMatch),
                                            Number(friendStats.gaPerMatch)
                                        )
                                        return (
                                            <div className="comparison-row">
                                                <span className={r.mine}>{myStats.gaPerMatch}</span>
                                                <span>🔥</span>
                                                <span className={r.theirs}>{friendStats.gaPerMatch}</span>
                                            </div>
                                        )
                                    })()}

                                </div>

                            </div>
                        )}

                    </div>
                )
            })}

        </div>
    )
}