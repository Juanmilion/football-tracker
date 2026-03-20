import "../styles/floating.css"
import { FaPlus } from "react-icons/fa"

export default function FloatingButton({ onClick }: any) {
    return (
        <button onClick={onClick}>
            <FaPlus />
        </button>
    )
}