import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"

function App() {

  const DEV_MODE = false

  const [session, setSession] = useState<any>(null)

  useEffect(() => {

    if (DEV_MODE) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  return (

    <div>

      {DEV_MODE ? (
        <Dashboard />
      ) : (
        !session ? <Auth /> : <Dashboard />
      )}

    </div>

  )
}

export default App