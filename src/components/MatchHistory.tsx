import { formatMatchDate } from "../lib/date"
import { FiEdit, FiTrash } from "react-icons/fi"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function MatchHistory({ matches, onDeleteMatch, onUpdateMatch }: any) {

    // DELETE
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

    // EDIT
    const [editingMatch, setEditingMatch] = useState<any | null>(null)
    const [goals, setGoals] = useState(0)
    const [assists, setAssists] = useState(0)
    const [goalsFor, setGoalsFor] = useState(0)
    const [goalsAgainst, setGoalsAgainst] = useState(0)

    // PITCH
    const [pitch, setPitch] = useState("")
    const [pitches, setPitches] = useState<any[]>([])
    const [showNewPitch, setShowNewPitch] = useState(false)
    const [newPitch, setNewPitch] = useState("")

    // UX STATES
    const [saving, setSaving] = useState(false)
    const [addingPitch, setAddingPitch] = useState(false)

    // ---------------- FETCH PITCHES ----------------

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
    }

    // ---------------- ADD NEW PITCH ----------------

    const handleAddPitch = async () => {

        const name = newPitch.trim()
        if (!name || addingPitch) return

        setAddingPitch(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const exists = pitches.find(p =>
            p.name.toLowerCase() === name.toLowerCase()
        )

        if (exists) {
            setPitch(exists.id)
            setShowNewPitch(false)
            setNewPitch("")
            setAddingPitch(false)
            return
        }

        const { data, error } = await supabase
            .from("pitches")
            .insert({
                name,
                user_id: user.id
            })
            .select()

        if (!error && data) {
            const created = data[0]

            setPitches(prev => [...prev, created])
            setPitch(created.id)
            setNewPitch("")
            setShowNewPitch(false)
        }

        setAddingPitch(false)
    }

    // ---------------- DELETE ----------------

    const handleDeleteClick = (id: string) => {
        setSelectedMatchId(id)
        setShowConfirm(true)
    }

    const confirmDelete = async () => {
        if (!selectedMatchId) return

        const { error } = await supabase
            .from("matches")
            .delete()
            .eq("id", selectedMatchId)

        if (!error) {
            onDeleteMatch(selectedMatchId)
        }

        setShowConfirm(false)
        setSelectedMatchId(null)
    }

    // ---------------- EDIT ----------------

    const handleEditClick = (m: any) => {
        setEditingMatch(m)
        setGoals(m.goals)
        setAssists(m.assists)
        setGoalsFor(m.goals_for || 0)
        setGoalsAgainst(m.goals_against || 0)
        setPitch(m.pitch_id || "")
    }

    const calculateRating = () => {
        let impacto = 0

        if (goalsFor > 0) {
            impacto = (goals + assists) / goalsFor
        }

        const win = goalsFor > goalsAgainst ? 1 : 0

        let score = impacto + (win * 0.1)
        score = Math.min(score, 1)

        let rating = 5 + (score * 5)

        return Math.round(rating * 10) / 10
    }

    const handleUpdate = async () => {
        if (!editingMatch || saving) return

        setSaving(true)

        const rating = calculateRating()
        const selectedPitchObj = pitches.find(p => p.id === pitch)

        const { error } = await supabase
            .from("matches")
            .update({
                goals,
                assists,
                goals_for: goalsFor,
                goals_against: goalsAgainst,
                rating,
                pitch_id: pitch
            })
            .eq("id", editingMatch.id)

        if (!error) {
            onUpdateMatch(editingMatch.id, {
                goals,
                assists,
                goals_for: goalsFor,
                goals_against: goalsAgainst,
                rating,
                pitch_id: pitch,
                pitches: { name: selectedPitchObj?.name || "Unknown" }
            })

            setEditingMatch(null)
        }

        setSaving(false)
    }

    // ---------------- UI ----------------

    const getRatingClass = (value: number) => {
        if (value < 6) return "rating low"
        if (value < 7.5) return "rating mid"
        if (value < 8.5) return "rating good"
        return "rating elite"
    }

    return (
        <section className="match-history">

            <h3>Match History</h3>

            <div className="table-container">
                <table>

                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Pitch</th>
                            <th>G</th>
                            <th>A</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {matches.map((m: any) => {

                            const rating = m.rating

                            return (
                                <tr key={m.id}>
                                    <td>{formatMatchDate(m.date)}</td>
                                    <td>{m.pitches?.name}</td>
                                    <td>{m.goals}</td>
                                    <td>{m.assists}</td>

                                    <td className={getRatingClass(rating || 0)}>
                                        {rating ? rating.toFixed(1) : "-"}
                                    </td>

                                    <td className="actions-cell">
                                        <button className="action-btn edit" onClick={() => handleEditClick(m)}>
                                            <FiEdit />
                                        </button>

                                        <button className="action-btn delete" onClick={() => handleDeleteClick(m.id)}>
                                            <FiTrash />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>

                </table>
            </div>

            {/* DELETE MODAL */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Delete match</h3>
                        <p>Are you sure you want to delete this match?</p>

                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </button>

                            <button className="modal-btn delete" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingMatch && (
                <div className="modal-overlay">
                    <div className="modal edit-modal">

                        <h3>Edit Match</h3>

                        <div className="edit-grid">

                            <div className="edit-block">
                                <p>Goals</p>
                                <input type="number" inputMode="numeric" value={goals} onChange={(e) => setGoals(Math.max(0, Number(e.target.value)))} />
                            </div>

                            <div className="edit-block">
                                <p>Assists</p>
                                <input type="number" inputMode="numeric" value={assists} onChange={(e) => setAssists(Math.max(0, Number(e.target.value)))} />
                            </div>

                            <div className="edit-block">
                                <p>Team Goals</p>
                                <input type="number" inputMode="numeric" value={goalsFor} onChange={(e) => setGoalsFor(Math.max(0, Number(e.target.value)))} />
                            </div>

                            <div className="edit-block">
                                <p>Opponent Goals</p>
                                <input type="number" inputMode="numeric" value={goalsAgainst} onChange={(e) => setGoalsAgainst(Math.max(0, Number(e.target.value)))} />
                            </div>

                        </div>

                        {/* PITCH */}
                        <div className="edit-pitch">
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

                                    <button onClick={handleAddPitch} disabled={addingPitch}>
                                        {addingPitch ? "Adding..." : "Add"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setEditingMatch(null)}>
                                Cancel
                            </button>

                            <button
                                className="modal-btn save"
                                onClick={handleUpdate}
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </section>
    )
}