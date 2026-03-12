import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js"

import { Bar, Doughnut } from "react-chartjs-2"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
)

export default function StatsCharts() {

    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
            .from("matches")
            .select(`
            goals,
            assists,
            pitches(name)
        `)
            .eq("user_id", user.id)   // solo partidos del usuario logueado

        if (!error && data) {
            setData(data)
        }

    }

    const goalsPerPitch: any = {}
    const assistsPerPitch: any = {}

    let totalGoals = 0
    let totalAssists = 0

    data.forEach((m) => {

        const pitch = m.pitches?.name || "Unknown"

        goalsPerPitch[pitch] =
            (goalsPerPitch[pitch] || 0) + m.goals

        assistsPerPitch[pitch] =
            (assistsPerPitch[pitch] || 0) + m.assists

        totalGoals += m.goals
        totalAssists += m.assists
    })

    // GOALS PER PITCH

    const goalsChart = {
        labels: Object.keys(goalsPerPitch),
        datasets: [
            {
                label: "Goals",
                data: Object.values(goalsPerPitch),
                backgroundColor: "#00c853"
            }
        ]
    }

    // ASSISTS PER PITCH

    const assistsChart = {
        labels: Object.keys(assistsPerPitch),
        datasets: [
            {
                label: "Assists",
                data: Object.values(assistsPerPitch),
                backgroundColor: "#2962ff"
            }
        ]
    }

    // GOAL CONTRIBUTION %

    const contributionChart = {
        labels: ["Goals", "Assists"],
        datasets: [
            {
                data: [totalGoals, totalAssists],
                backgroundColor: [
                    "#00c853",
                    "#2962ff"
                ]
            }
        ]
    }

    // BEST PITCH RANKING (goals + assists)

    const pitchContribution: any = {}

    data.forEach((m) => {

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

                <h3>Goals per Pitch</h3>

                <Bar data={goalsChart} />

            </div>

            <div className="chart-card">

                <h3>Assists per Pitch</h3>

                <Bar data={assistsChart} />

            </div>

            <div className="chart-card">

                <h3>Goal Contribution %</h3>

                <Doughnut data={contributionChart} />

            </div>

            <div className="chart-card">

                <h3>Best Pitch Ranking</h3>

                <Bar data={bestPitchChart} />

            </div>

        </div>
    )
}