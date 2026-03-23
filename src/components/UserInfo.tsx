import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function UserInfo() {

    const [username, setUsername] = useState("")

    useEffect(() => {
        getUsername()
    }, [])

    const getUsername = async () => {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single()

        if (data) {
            setUsername(data.username)
        }
    }

    return (
        <h3 className="user-info">
            {username}
        </h3>
    )
}