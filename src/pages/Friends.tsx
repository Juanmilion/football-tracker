import Title from "../components/Title"
import AddFriend from "../components/AddFriend"
import FriendRequests from "../components/FriendRequests"
import FriendsList from "../components/FriendsList"
import UserInfo from "../components/UserInfo"

export default function Friends() {
    return (
        <div className="container">
            <Title />
            <UserInfo />
            <FriendRequests />
            <FriendsList />
            <AddFriend />

        </div>
    )
}
