import Title from "../components/Title"
import AddFriend from "../components/AddFriend"
import FriendRequests from "../components/FriendRequests"
import FriendsList from "../components/FriendsList"

export default function Friends() {
    return (
        <div className="container">
            <Title />
            <FriendRequests />
            <FriendsList />
            <AddFriend />

        </div>
    )
}
