import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedRoute() {

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
            setLoading(false)
        })
    }, [])

    if (loading) return null

    if (!user) return <Navigate to="/auth" replace />

    return <Outlet />
}