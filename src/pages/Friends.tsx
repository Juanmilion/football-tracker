import Title from "../components/Title"
import AddFriend from "../components/AddFriend"
import FriendRequests from "../components/FriendRequests"

export default function Friends() {
    return (
        <div className="container">
            <Title />
            <FriendRequests />
            <AddFriend />
        </div>
    )
}