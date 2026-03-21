import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function AddMatch() {

    const [goals, setGoals] = useState(0)
    const [assists, setAssists] = useState(0)
    const [pitch, setPitch] = useState("")
    const [pitches, setPitches] = useState<any[]>([])
    const [message, setMessage] = useState("")
    const [showNewPitch, setShowNewPitch] = useState(false)
    const [newPitch, setNewPitch] = useState("")

    useEffect(() => {
        fetchPitches()
    }, [])

    // ✅ FETCH CORRECTO (globales + tuyas)
    const fetchPitches = async () => {

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from("pitches")
            .select("*")
            .or(`user_id.is.null,user_id.eq.${user.id}`)
            .order("name", { ascending: true })

        if (!error && data) {
            setPitches(data)
        }

        // última pista
        const lastPitch = localStorage.getItem("lastPitch")
        if (lastPitch) setPitch(lastPitch)
    }

    const changeValue = (setter: any, value: number, delta: number) => {
        const newValue = value + delta
        if (newValue < 0) return
        setter(newValue)
    }

    // ✅ ADD PITCH CON USER + CONTROL DUPLICADOS
    const handleAddPitch = async () => {

        const name = newPitch.trim()
        if (!name) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 🔴 evitar duplicados (case insensitive)
        const exists = pitches.find(p =>
            p.name.toLowerCase() === name.toLowerCase()
        )

        if (exists) {
            setPitch(exists.id)
            setShowNewPitch(false)
            setNewPitch("")
            return
        }

        const { data, error } = await supabase
            .from("pitches")
            .insert({
                name,
                user_id: user.id
            })
            .select()

        if (error) return

        const created = data[0]

        setPitches(prev => [...prev, created])
        setPitch(created.id)

        setNewPitch("")
        setShowNewPitch(false)
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

                <select
                    value={pitch}
                    onChange={(e) => {
                        if (e.target.value === "new") {
                            setShowNewPitch(true)
                        } else {
                            setPitch(e.target.value)
                        }
                    }}
                >
                    <option value="">Select pitch</option>

                    {pitches.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}

                    <option value="new">+ Add new pitch</option>
                </select>

                {showNewPitch && (
                    <div className="new-pitch">

                        <input
                            placeholder="Pitch name"
                            value={newPitch}
                            onChange={(e) => setNewPitch(e.target.value)}
                        />

                        <button onClick={handleAddPitch}>
                            Add
                        </button>

                    </div>
                )}
            </div>

            {/* SAVE */}
            <button className="save-fixed" onClick={addMatch}>
                Save Match ⚽
            </button>

            {message && <p className="form-message">{message}</p>}

        </div>
    )
}