export type User = {
    name: string,
    id: string | number,
    avatar: string,
    socketId?: string | null,
    online: boolean,

}

export type Message = {
    author: User,
    recipient: User,
    text: string,
    socketId: string,
    created: Date
}