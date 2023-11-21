import styles from "../../styles/ChatCard.module.css"
import { useRouter } from 'next/router';
import { dateToHuman } from "../helperClient";

interface CardParams {
    username: string,
    time: string,
    message: string,
    id: string,
    unreadCount: number
}

function handleClick() {
    console.log(styles);
}

export default function ChatCard({ username, time, message, id, unreadCount }: CardParams) {
    const router = useRouter();

    return (
        <div
            className={styles.card}
            onClick={() => {
                window.history.pushState({}, undefined, `?chat=${id}`);
                window.location.reload();
            }}
        >
            <div className={styles.pfpCon}>
                <div className={styles.pfp}></div>
            </div>
            <div className={styles.info}>
                <div className={styles.username}>{username}</div>
                <div className={styles.message}>{message}</div>
            </div>
            <div className={styles.time}>
                {dateToHuman(time)}
                <div className={styles.unread} style={{
                    display: unreadCount === 0 ? "none" : "flex"
                }}>{unreadCount}</div>
            </div>

        </div>
    );
}
