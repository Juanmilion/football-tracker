import { useState } from "react"
import { supabase } from "../lib/supabase"
import "../styles/app.css"
import { useEffect } from "react"

export default function AddFriend() {

    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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

            {error && <p>{error}</p>}

            {result && (
                <div className="friend-result">

                    <p>{result.username}</p>

                    {result.id === currentUserId ? (
                        <span className="self-label-friend">You</span>
                    ) : (
                        <button>Add</button>
                    )}

                </div>
            )}

        </div>
    )
}