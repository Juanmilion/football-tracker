import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function FriendRequests() {

    const [requests, setRequests] = useState<any[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [toast, setToast] = useState<string | null>(null)

    useEffect(() => {
        getUser()
    }, [])

    const getUser = async () => {
        console.log(userId)
        const { data } = await supabase.auth.getUser()
        const id = data.user?.id || null
        setUserId(id)

        if (id) fetchRequests(id)
    }

    const fetchRequests = async (id: string) => {

        // 1. traer requests
        const { data: requestsData } = await supabase
            .from("friends")
            .select("id, user_id")
            .eq("friend_id", id)
            .eq("status", "pending")

        if (!requestsData) return

        // 2. traer usernames
        const userIds = requestsData.map(r => r.user_id)

        const { data: users } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", userIds)

        // 3. merge manual
        const merged = requestsData.map(r => ({
            ...r,
            username: users?.find(u => u.id === r.user_id)?.username
        }))

        setRequests(merged)
    }

    const acceptRequest = async (requestId: string) => {

        const { error } = await supabase
            .from("friends")
            .update({ status: "accepted" })
            .eq("id", requestId)

        if (!error) {

            setRequests(prev => prev.filter(r => r.id !== requestId))

            // 🔥 mostrar mensaje
            setToast("Friend added ⚽")

            // ⏳ desaparecer en 2.5s
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

            {requests.length === 0 && (
                <p>No requests</p>
            )}

            {requests.map(r => (

                <div key={r.id} className="friend-result">

                    <p>{r.username}</p>

                    <button onClick={() => acceptRequest(r.id)}>
                        Accept
                    </button>

                </div>

            ))}

        </div>
    )
}