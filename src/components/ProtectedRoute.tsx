// components/ProtectedRoute.tsx
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }: any) {

    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
        setLoading(false)
    }

    if (loading) return null

    if (!user) return <Navigate to="/auth" />

    return children
}