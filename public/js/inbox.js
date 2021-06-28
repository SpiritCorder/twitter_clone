const chatResultContainer = document.querySelector('.resultsContainer');

// function getChatName(chat) {
//     let chatName = chat.chatName;

//     if(!chatName) {

//         if(chat.users.length == 1) {
//             chatName = chat.users.firstName + " " + chat.users.lastName;
            
//         } else {

//             const filterMe = chat.users.filter(user => user._id != authUser._id);

//             const names = filterMe.map(obj => obj.firstName +  " " + obj.lastName);

//             chatName = names.join(", ")
//         }
//     }

//     return chatName;
// }

// function createImageHtml(url) {
//     return `<img src="${url}" alt="chat-Image">`
// }

// function getImage(chat) {

//     const output = {
//         html: "",
//         class: ""
//     }
    
    
//     if(chat.users.length == 1) {
//         output.html = createImageHtml(chat.users[0].profilePic);
        
//     } else {

        
//         const otherUsers = chat.users.filter(user => user._id != authUser._id);
//         if(otherUsers.length > 1) {
//             let result = createImageHtml(otherUsers[0].profilePic)
//             result += createImageHtml(otherUsers[1].profilePic)

//             output.html = result
//             output.class = "double"
           
//         } else {
//             output.html = createImageHtml(otherUsers[0].profilePic)
            
//         }   


//     }

//     return output;
// }

// function getLatestMessage(latestMessage) {
//     if(latestMessage) {

//         const name = latestMessage.sender.firstName + " " + latestMessage.sender.lastName;

//         return `${name}: ${latestMessage.content}`
//     }

//     return 'New Chat';
// }

// function createChatHtml(chat) {
//     const div = document.createElement('div');
//     div.classList.add('chat');

//     const chatName = getChatName(chat);
//     const image = getImage(chat);

//     const latestMessage = getLatestMessage(chat.latestMessage);

//     const imageContainer = `
//         <div class="chatImageContainer ${image.class}">
//             ${image.html}
//         </div>
//     `;


//     div.innerHTML = `
//         <a href='/messages/${chat._id}'>
//             ${imageContainer}
//             <div class="chatDetailsContainer ellipsis">
//                 <span class="header ellipsis">${chatName}</span>
//                 <span class="subText ellipsis">${latestMessage}</span>
//             </div>
//         </a>
//     `;

//     return div;
// }


function outputChatData(chats) {
    if(chats.length == 0) {
        chatResultContainer.innerHTML = `<span class="noResult">No Chats are available</span>`;
    }

    chats.forEach(chat => {
        const html = createChatHtml(chat)
        chatResultContainer.append(html);
    })
}


// Get user chat data
function getChatData() {
    fetch('/api/chats', {method: 'GET'})
        .then(res => res.text())
        .then(data => {
            const chats = JSON.parse(data);
            console.log(chats)
            outputChatData(chats)
        })
        .catch(err => console.log(err))
}



document.addEventListener('DOMContentLoaded', () => {
    getChatData()
})