import { FaPlus } from "react-icons/fa"

export default function FloatingButton({ onClick }: any) {
    return (
        <button className="fab" onClick={onClick}>
            <FaPlus />
        </button>
    )
}