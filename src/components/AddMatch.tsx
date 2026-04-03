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
    const [goalAnim, setGoalAnim] = useState<"up" | "down" | null>(null)
    const [assistAnim, setAssistAnim] = useState<"up" | "down" | null>(null)
    const [goalsFor, setGoalsFor] = useState(0)

    useEffect(() => {
        fetchPitches()
    }, [])

    const fetchPitches = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from("pitches")
            .select("*")
            .or(`user_id.is.null,user_id.eq.${user.id}`)
            .order("name", { ascending: true })

        if (data) setPitches(data)

        const lastPitch = localStorage.getItem("lastPitch")
        if (lastPitch) setPitch(lastPitch)
    }

    const changeValue = (setter: any, value: number, delta: number, setAnim: any) => {
        const newValue = value + delta
        if (newValue < 0) return

        setter(newValue)

        const direction = delta > 0 ? "up" : "down"
        setAnim(direction)

        if (navigator.vibrate) navigator.vibrate(10)

        setTimeout(() => setAnim(null), 180)
    }

    const handleAddPitch = async () => {
        const name = newPitch.trim()
        if (!name) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

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
            .insert({ name, user_id: user.id })
            .select()

        if (error) return

        const created = data[0]

        setPitches(prev => [...prev, created])
        setPitch(created.id)

        setNewPitch("")
        setShowNewPitch(false)
    }

    const calculateRating = () => {

        if (goalsFor === 0) return 5

        let impacto = (goals + assists) / goalsFor

        // 🔥 curva más realista
        impacto = Math.pow(impacto, 0.8)

        let rating = 5 + (impacto * 5)

        return Math.min(10, Math.round(rating * 10) / 10)
    }

    const addMatch = async () => {

        setMessage("")

        if (!pitch) {
            setMessage("Select a pitch")
            return
        }

        if (goalsFor === 0 && (goals > 0 || assists > 0)) {
            setMessage("Invalid: team scored 0 but you have stats")
            return
        }

        if (goals + assists > goalsFor) {
            setMessage("Invalid: contributions exceed team goals")
            return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const today = new Date().toISOString().split("T")[0]

        const rating = calculateRating()

        const { error } = await supabase
            .from("matches")
            .insert({
                user_id: user.id,
                pitch_id: pitch,
                date: today,
                goals,
                assists,
                goals_for: goalsFor,
                rating,
                rating_version: 3
            })

        if (error) {
            setMessage("Error saving match")
        } else {
            setMessage(`Match saved ⚽ Rating: ${rating}`)

            localStorage.setItem("lastPitch", pitch)

            setGoals(0)
            setAssists(0)
            setGoalsFor(0)
        }
    }

    return (
        <div className="add-container">

            {/* GOALS */}
            <div className="counter">
                <p>Goals</p>

                <div className="counter-controls">
                    <button onClick={() => changeValue(setGoals, goals, -1, setGoalAnim)}>−</button>

                    <span className={`counter-value ${goalAnim}`}>
                        {goals}
                    </span>

                    <button onClick={() => changeValue(setGoals, goals, 1, setGoalAnim)}>+</button>
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
                    <button onClick={() => changeValue(setAssists, assists, -1, setAssistAnim)}>−</button>

                    <span className={`counter-value ${assistAnim}`}>
                        {assists}
                    </span>

                    <button onClick={() => changeValue(setAssists, assists, 1, setAssistAnim)}>+</button>
                </div>

                <div className="quick-buttons">
                    {[1, 2, 3].map(n => (
                        <button key={n} onClick={() => setAssists(assists + n)}>
                            +{n}
                        </button>
                    ))}
                </div>
            </div>

            {/* TEAM GOALS */}
            <div className="counter">
                <p>Team Goals</p>

                <div className="counter-controls">
                    <button onClick={() => changeValue(setGoalsFor, goalsFor, -1, () => { })}>−</button>

                    <input
                        type="number"
                        min="0"
                        value={goalsFor}
                        onChange={(e) => setGoalsFor(Math.max(0, Number(e.target.value)))}
                        className="counter-input"
                    />

                    <button onClick={() => changeValue(setGoalsFor, goalsFor, 1, () => { })}>+</button>
                </div>

                <div className="quick-buttons">
                    {[5, 10, 15].map(n => (
                        <button key={n} onClick={() => setGoalsFor(n)}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* PITCH */}
            <div className="form-group" style={{ marginTop: "25px" }}>
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

            <button className="save-fixed" onClick={addMatch}>
                Save Match ⚽
            </button>

            {message && <p className="form-message">{message}</p>}

        </div>
    )
}