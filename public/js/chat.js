var typing = false;

const chatNameChangeBtn = document.getElementById('ChangeChatNameBtn');
const chatNameInput = document.getElementById('chatNameValue');
const messageInput = document.getElementById('messageContent');
const messageBtn = document.getElementById('sendMessageBtn');
const span = document.getElementById('chatName');
const chatMessages = document.querySelector('.chatMessages');
const typingIndicator = document.querySelector('.typingIndicator');

function addTypingIndicator() {
    
    typingIndicator.classList.add('typing')
    
}

function removeTypingIndicator() {
    typingIndicator.classList.remove('typing')
}



// Change chat name
chatNameInput.addEventListener('input', e => {
    const val = e.target.value.trim();

    if(val != "") {
        chatNameChangeBtn.removeAttribute('disabled')
    } else {
        chatNameChangeBtn.setAttribute('disabled', true)
    }
})


chatNameChangeBtn.addEventListener('click', e => {

    if(chatNameInput.value == "") return alert("Please enter a chat name");


    fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chatName: chatNameInput.value})
    })
    .then(res => res.text())
    .then(data => window.location.reload())
    .catch(err => console.log(err) )
})

function getChatName(chat) {
    let chatName = chat.chatName;

    if(!chatName) {

        if(chat.users.length == 1) {
            chatName = chat.users.firstName + " " + chat.users.lastName;
            
        } else {

            const filterMe = chat.users.filter(user => user._id != authUser._id);

            const names = filterMe.map(obj => obj.firstName +  " " + obj.lastName);

            chatName = names.join(", ")
        }
    }

    return chatName;
}



function handleChatName() {
    fetch(`/api/chats/${chatId}`, {method: 'GET'})
        .then(res => res.text())
        .then(data => {
            const chat = JSON.parse(data)

            const chatName = getChatName(chat).toString()
            span.innerText = chatName;
        })
}

function returnMessageHtmlText(msg, previousSenderId, nextMessage) {

    const name = msg.sender.firstName + " " + msg.sender.lastName;

    const isMine = msg.sender._id == authUser._id;
    let className = isMine ? 'mine' : 'theirs';

    const currentSenderId = msg.sender._id;
    const nextSenderId = nextMessage ? nextMessage.sender._id : '';

    const isFirst = previousSenderId != currentSenderId;
    const isLast = currentSenderId != nextSenderId;

    className += isFirst ? " first" : '';
    className += isLast ? " last" : '';

    let span = ""

    if(isFirst) {
        if(msg.sender._id != authUser._id) {
            span = `<span class="messengerName">${name}</span>`
        }
    }


    let image = ""

    if(isLast) {
       image = `<img src='${msg.sender.profilePic}' alt="image" >`
    }

    let imageContainer = ""

    if(!isMine) {
        imageContainer = `
            <div class="imageContainer">
                ${image}
            </div>
        `;
    }



    const html = `
        <li class="message ${className}">
            ${imageContainer}
            <div class="messageContainer">
                ${span}
                <span class="messageBody">${msg.content}</span>
            </div>
        </li>
    `;

    return html;
}

function scrollBottom() {

    chatMessages.scrollTop = chatMessages.scrollHeight
}


function createMessageHtml(message) {

    console.log(message);
   console.log(authUser)

    const isMine = message.sender._id.toString() == authUser._id;
    const liClass = isMine ? "mine" : "theirs"

    let imageContainer = ""
    if(message.sender._id != authUser._id) {
        imageContainer = `
            <div class="imageContainer">
                <img src='${message.sender.profilePic}' alt="image" >
            </div>
        `;
    }

    const li = document.createElement('li');
    li.classList.add("message")
    li.classList.add("new")
    li.classList.add(liClass)

    li.innerHTML = `
        ${imageContainer}
        <div class="messageContainer">
            <span class="messageBody">${message.content}</span>
        </div>
    `
    return li;

}

function renderMessagesToPage(html, isAppend=true) {

    if(isAppend) {
        chatMessages.append(html)
    } else {
        chatMessages.innerHTML = html
    }
    

    scrollBottom()
}



function handleMessage() {

    const content = messageInput.value;

    if(connected) {
        typing = false
        socket.emit('stop typing', chatId)
    }

    sendMessage(content)
    messageInput.value = "";
    messageBtn.setAttribute('disabled', true)
}




function sendMessage(content) {

    const body = {
        content,
        chat: chatId
    }
    
    fetch('/api/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    .then(res => res.text())
    .then(data => {
        const message = JSON.parse(data)

        chatMessages.classList.add('smooth')  

        const html = createMessageHtml(message)
        renderMessagesToPage(html)

        if(connected) {

            console.log(message)

            socket.emit('new message', message)
        }

        
        
    })
    .catch(err => console.log(err))
}

// Fetch all the messages

function fetchMessages() {
    fetch('/api/chats/'+ chatId + '/messages', {method: 'GET'})
        .then(res => res.text())
        .then(data => {
            const messages = JSON.parse(data)
            const arr = [];

            let previousSenderId = "";


            messages.forEach((msg, index) => {

                const html = returnMessageHtmlText(msg, previousSenderId, messages[index + 1])
                arr.push(html)

                previousSenderId = msg.sender._id;
            })

            const allHtml = arr.join("")

            renderMessagesToPage(allHtml, false)

           markAllMessagesAsRead()
            
        })
        .catch(err => console.log(err))
}

function updateTyping() {
    if(connected) {
        typing = true
        socket.emit('typing', chatId)
    }

    let lastTypedTime = new Date().getTime()
    let timerLength = 3000;

    setTimeout(() => {
        let timeNow = new Date().getTime();
        const timeDiff = timeNow - lastTypedTime;

        if(timeDiff >= timerLength && typing) {
            typing = false
            socket.emit('stop typing', chatId)
        }

    }, timerLength)
}


function markAllMessagesAsRead() {
    fetch(`/api/chats/${chatId}/messages/markAsRead`, {method: 'PUT'})
        .then(res => res.text())
        .then(data => refreshMessagesBadge())
        .catch(err => console.log(err))
}

// Enable and disable the message button
messageInput.addEventListener('keyup', e => {

    updateTyping()

    if(e.target.value.trim() != "") {

        messageBtn.removeAttribute('disabled')

        if(e.code === 'Enter') {
            handleMessage()
        }
    } else {
        messageBtn.setAttribute('disabled', true)
    }
});

// handle message send button click
messageBtn.addEventListener('click', e => {
    handleMessage()
})

document.addEventListener('DOMContentLoaded', () => {
    socket.emit('join room', chatId)
    socket.on('typing', () => {
    
        addTypingIndicator()
    
    })
    socket.on('stop typing', () => removeTypingIndicator())

   

    handleChatName()
    fetchMessages()
})