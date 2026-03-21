import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function AddMatch() {

    const [goals, setGoals] = useState(0)
    const [assists, setAssists] = useState(0)
    const [pitch, setPitch] = useState("")
    const [pitches, setPitches] = useState<any[]>([])
    const [message, setMessage] = useState("")

    useEffect(() => {
        fetchPitches()
    }, [])

    const fetchPitches = async () => {
        const { data } = await supabase.from("pitches").select("*")
        if (data) setPitches(data)

        // 👉 cargar última pista usada
        const lastPitch = localStorage.getItem("lastPitch")
        if (lastPitch) setPitch(lastPitch)
    }

    const changeValue = (setter: any, value: number, delta: number) => {
        const newValue = value + delta
        if (newValue < 0) return
        setter(newValue)
    }

    const addMatch = async () => {

        setMessage("")

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const today = new Date().toISOString().split("T")[0]

        const { error } = await supabase
            .from("matches")
            .insert({
                user_id: user.id,
                pitch_id: pitch,
                date: today,
                goals,
                assists
            })

        if (error) {
            setMessage("Error saving match")
        } else {
            setMessage("Match saved ⚽")

            // guardar última pista
            localStorage.setItem("lastPitch", pitch)

            setGoals(0)
            setAssists(0)
        }
    }

    return (

        <div className="add-container">

            {/* GOALS */}
            <div className="counter">
                <p>Goals</p>

                <div className="counter-controls">
                    <button onClick={() => changeValue(setGoals, goals, -1)}>-</button>

                    <span>{goals}</span>

                    <button onClick={() => changeValue(setGoals, goals, 1)}>+</button>
                </div>

                <div className="quick-buttons">
                    {[1, 2, 3].map(n => (
                        <button key={n} onClick={() => setGoals(goals + n)}>
                            +{n}
                        </button>
                    ))}
                </div>
            </div>

            {/* ASSISTS */}
            <div className="counter">
                <p>Assists</p>

                <div className="counter-controls">
                    <button onClick={() => changeValue(setAssists, assists, -1)}>-</button>

                    <span>{assists}</span>

                    <button onClick={() => changeValue(setAssists, assists, 1)}>+</button>
                </div>

                <div className="quick-buttons">
                    {[1, 2, 3].map(n => (
                        <button key={n} onClick={() => setAssists(assists + n)}>
                            +{n}
                        </button>
                    ))}
                </div>
            </div>

            {/* PITCH */}
            <div className="form-group">
                <p>Pitch</p>

                <select value={pitch} onChange={(e) => setPitch(e.target.value)}>
                    <option value="">Select pitch</option>
                    {pitches.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* SAVE BUTTON */}
            <button className="save-fixed" onClick={addMatch}>
                Save Match ⚽
            </button>

            {message && <p className="form-message">{message}</p>}

        </div>
    )
}