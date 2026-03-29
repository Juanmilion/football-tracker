import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function FriendRequests() {

    const [requests, setRequests] = useState<any[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [toast, setToast] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getUser()
    }, [])

    const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        const id = data.user?.id || null
        setUserId(id)

        if (id) fetchRequests(id)
    }

    console.log(userId)

    const fetchRequests = async (id: string) => {

        setLoading(true)

        const { data: requestsData } = await supabase
            .from("friends")
            .select("id, user_id")
            .eq("friend_id", id)
            .eq("status", "pending")

        if (!requestsData) {
            setLoading(false)
            return
        }

        const userIds = requestsData.map(r => r.user_id)

        const { data: users } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", userIds)

        const merged = requestsData.map(r => ({
            ...r,
            username: users?.find(u => u.id === r.user_id)?.username
        }))

        // 🔥 pequeño delay para suavizar UX
        await new Promise(r => setTimeout(r, 200))

        setRequests(merged)
        setLoading(false)
    }

    const acceptRequest = async (requestId: string) => {

        const { error } = await supabase
            .from("friends")
            .update({ status: "accepted" })
            .eq("id", requestId)

        if (!error) {

            setRequests(prev => prev.filter(r => r.id !== requestId))

            setToast("Friend added ⚽")

            setTimeout(() => {
                setToast(null)
            }, 2500)
        }
    }

    return (

        <div className="card-friend">

            {toast && (
                <div className="toast">
                    {toast}
                </div>
            )}

            <h3>Requests</h3>

            {/* 🔥 LOADING */}
            {loading ? (
                <div className="skeleton-container">

                    <div className="skeleton-card small"></div>
                    <div className="skeleton-card small"></div>

                </div>
            ) : requests.length === 0 ? (
                <p>No requests</p>
            ) : (
                requests.map(r => (

                    <div key={r.id} className="friend-result fade-in">

                        <p>{r.username}</p>

                        <button onClick={() => acceptRequest(r.id)}>
                            Accept
                        </button>

                    </div>

                ))
            )}

        </div>
    )
}