import "../styles/app.css"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js"

import { Bar } from "react-chartjs-2"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
)

export default function StatsCharts({ data }: any) {

    const goalsPerPitch: any = {}
    const assistsPerPitch: any = {}

    let totalGoals = 0
    let totalAssists = 0

    data.forEach((m: any) => {

        const pitch = m.pitches?.name || "Unknown"

        goalsPerPitch[pitch] =
            (goalsPerPitch[pitch] || 0) + m.goals

        assistsPerPitch[pitch] =
            (assistsPerPitch[pitch] || 0) + m.assists

        totalGoals += m.goals
        totalAssists += m.assists
    })

    const pitchContribution: any = {}

    data.forEach((m: any) => {
        const pitch = m.pitches?.name || "Unknown"

        pitchContribution[pitch] =
            (pitchContribution[pitch] || 0) +
            m.goals +
            m.assists
    })

    const bestPitchChart = {
        labels: Object.keys(pitchContribution),
        datasets: [
            {
                label: "Goal Contributions",
                data: Object.values(pitchContribution),
                backgroundColor: "#ff9800"
            }
        ]
    }

    return (

        <div className="charts">
            <div className="chart-card">
                <h3>Best Pitch Ranking</h3>
                <div className="chart-wrapper">
                    <Bar data={bestPitchChart} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>
        </div>
    )
}