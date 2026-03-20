import "../styles/floating.css"

export default function FloatingButton({ onClick }: any) {
    return (
        <button className="fab" onClick={onClick}>
            +
        </button>
    )
}