import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function AddMatch() {

    const [date, setDate] = useState("")
    const [goals, setGoals] = useState(0)
    const [assists, setAssists] = useState(0)
    const [pitch, setPitch] = useState("")
    const [message, setMessage] = useState("")
    const [pitches, setPitches] = useState<any[]>([])

    // Cargar pitches desde Supabase
    useEffect(() => {

        const fetchPitches = async () => {

            const { data, error } = await supabase
                .from("pitches")
                .select("*")

            if (!error && data) {
                setPitches(data)
            }

        }

        fetchPitches()

    }, [])

    const addMatch = async () => {

        setMessage("")

        const { data: { user } } = await supabase.auth.getUser()

        const userId = user?.id || null

        const { error } = await supabase
            .from("matches")
            .insert({
                user_id: userId,
                pitch_id: pitch,
                date,
                goals,
                assists
            })

        if (error) {
            setMessage("Error saving match")
        } else {
            setMessage("Match saved ⚽")

            setDate("")
            setGoals(0)
            setAssists(0)
            setPitch("")
        }
    }

    return (

        <div className="match-card">

            <h2>Add Match</h2>

            <div className="form-group">

                <label>Date</label>

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

            </div>

            <div className="form-row">

                <div className="form-group">

                    <label>Goals</label>

                    <input
                        type="number"
                        value={goals}
                        onChange={(e) => setGoals(Number(e.target.value))}
                    />

                </div>

                <div className="form-group">

                    <label>Assists</label>

                    <input
                        type="number"
                        value={assists}
                        onChange={(e) => setAssists(Number(e.target.value))}
                    />

                </div>

            </div>

            <div className="form-group">

                <label>Pitch</label>

                <select
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                >

                    <option value="">
                        Select a pitch
                    </option>

                    {pitches.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}

                </select>

            </div>

            <button
                className="save-btn"
                onClick={addMatch}
            >
                Save Match
            </button>

            {message && (
                <p className="form-message">
                    {message}
                </p>
            )}

        </div>

    )
}