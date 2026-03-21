import { useState } from "react"
import { supabase } from "../lib/supabase"
import "../styles/app.css"
import { useEffect } from "react"

export default function AddFriend() {

    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const [status, setStatus] = useState<"idle" | "pending" | "friend">("idle")

    const [search, setSearch] = useState("")
    const [result, setResult] = useState<any | null>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        getUser()
    }, [])

    const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        setCurrentUserId(data.user?.id || null)
    }

    const handleSearch = async () => {

        setError("")
        setResult(null)
        setStatus("idle")

        if (!search.trim()) return

        const { data, error } = await supabase
            .from("profiles")
            .select("id, username")
            .eq("username", search)
            .maybeSingle()

        if (error || !data) {
            setError("User not found")
            return
        }

        setResult(data)

        // 🔍 comprobar relación existente
        const { data: relation } = await supabase
            .from("friends")
            .select("status")
            .or(
                `and(user_id.eq.${currentUserId},friend_id.eq.${data.id}),and(user_id.eq.${data.id},friend_id.eq.${currentUserId})`
            )
            .maybeSingle()

        if (relation) {
            if (relation.status === "pending") {
                setStatus("pending")
            } else if (relation.status === "accepted") {
                setStatus("friend")
            }
        }
    }

    const handleAddFriend = async () => {

        if (!result || !currentUserId) return

        const { error } = await supabase
            .from("friends")
            .insert({
                user_id: currentUserId,
                friend_id: result.id,
                status: "pending"
            })

        if (error) {
            setError("Error sending request")
        } else {
            setError("Request sent")
            setStatus("pending")
        }
    }

    return (

        <div className="card-friend">

            <h3>Add Friend</h3>

            <input
                placeholder="Search username"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <button onClick={handleSearch}>
                Search
            </button>

            {error && <p style={{ marginTop: "10px" }}>{error}</p>}

            {result && (
                <div className="friend-result">

                    <p>{result.username}</p>

                    {result.id === currentUserId ? (
                        <span className="self-label-friend">You</span>
                    ) : status === "friend" ? (
                        <button disabled className="btn-disabled">
                            Friend
                        </button>
                    ) : status === "pending" ? (
                        <button disabled className="btn-disabled">
                            Pending
                        </button>
                    ) : (
                        <button onClick={handleAddFriend}>
                            Add
                        </button>
                    )}

                </div>
            )}

        </div>
    )
}