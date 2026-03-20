import { calculateMatchRating } from "../lib/stats"

export default function MatchHistory({ matches }: any) {

    const getRatingClass = (value: number) => {
        if (value < 5) return "rating low"
        if (value < 7) return "rating mid"
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
                        </tr>
                    </thead>

                    <tbody>

                        {matches.map((m: any) => {

                            const rating = calculateMatchRating(m.goals, m.assists)

                            return (
                                <tr key={m.id}>
                                    <td>{m.date}</td>
                                    <td>{m.pitches?.name}</td>
                                    <td>{m.goals}</td>
                                    <td>{m.assists}</td>
                                    <td className={getRatingClass(rating)}>
                                        {rating}
                                    </td>
                                </tr>
                            )
                        })}

                    </tbody>

                </table>
            </div>

        </section>
    )
}