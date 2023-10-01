let connected = false;

console.log(window.location.host);

let socket = io(`http://${window.location.host}`)

console.log(authUser)

socket.emit('setUp', authUser)


socket.on('connected', () => connected = true)

socket.on('message received', newMessage => {

    console.log("Message received successfully " + newMessage);
    
    receivedMessageHandler(newMessage)
})

socket.on("notification received", () => {
    refreshNotificationsBadge()

    fetch('/api/notifications/latest', {method: 'GET'})
        .then(res => res.json())
        .then(data => {
            console.log(data)
            showNotifications(data)
        })
        .catch(err => console.log(err))


})

function emitNotificationEvent(userId) {
    socket.emit("notification received", userId)
}