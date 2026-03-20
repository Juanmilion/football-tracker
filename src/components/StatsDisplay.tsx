import { useEffect, useState } from "react"

export default function StatDisplay({ value }: { value: number }) {

    const [display, setDisplay] = useState(0)
    const ratingClass =
        value < 4 ? "rating low"
            : value < 7 ? "rating mid"
                : value < 9 ? "rating high"
                    : "rating elite"

    useEffect(() => {
        let start = 0

        const duration = 1200
        const stepTime = 20
        const increment = value / (duration / stepTime)

        const interval = setInterval(() => {
            start += increment

            if (start >= value) {
                setDisplay(value)
                clearInterval(interval)
            } else {
                setDisplay(Math.floor(start))
            }
        }, stepTime)

        return () => clearInterval(interval)
    }, [value])

    return <span className={ratingClass}>{display}</span>
}