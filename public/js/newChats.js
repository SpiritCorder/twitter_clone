const chatUsersSearchInput = document.getElementById('chatUsersSearch');
const resultContainer = document.querySelector('.resultsContainer');
const addedUserContainer = document.getElementById('chatUserSearchContainer');
const createChat = document.querySelector('.createChat');

let timeoutId;

let selectedUsers = [];

function createSelectedUsersHtml() {
   

    const elements = [];

    selectedUsers.forEach(user => {
        const span = document.createElement('span');
        span.classList.add('selectedUser');
        span.innerText = `${user.firstName} ${user.lastName}`;

        elements.push(span)
    })

    $(".selectedUser").remove()

    $("#chatUserSearchContainer").prepend(elements)


}

function addUsers(user) {
    selectedUsers.push(user);
    createSelectedUsersHtml(); 
    chatUsersSearchInput.value = "";
    chatUsersSearchInput.focus();
    resultContainer.innerHTML = "";

    createChat.removeAttribute('disabled')

}

function outputSelectableUsers(users) {
    users.forEach(user => {
        if(user._id == authUser._id || selectedUsers.some(u => u._id == user._id)) {
            return;
        }

        const html =createUser(user, false)
        html.addEventListener('click', e => {
            addUsers(user)
        })
        resultContainer.append(html)
    })
}

function fetchUserData(val) {
    fetch(`/api/users?username=${val}`, {method: 'GET'})
        .then(res => res.text())
        .then(data => {
            const users = JSON.parse(data)

            resultContainer.innerHTML = "";
            
            outputSelectableUsers(users)
        })
        .catch(err => console.log(err))
}

chatUsersSearchInput.addEventListener('keyup', e => {

    const val = e.target.value.trim();

    if(val.length == 0 &&  (e.key === 'Delete')) {
        selectedUsers.pop();
        createSelectedUsersHtml();

        if(selectedUsers.length === 0) {
            createChat.setAttribute('disabled', true)
        }
    }


    if(timeoutId) {
        clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
        if(val == "") {
            resultContainer.innerHTML = "";
        } else {
            fetchUserData(val)
        }
    }, 1000)
})

createChat.addEventListener('click', e => {
    const body = JSON.stringify({users: selectedUsers});

    fetch('/api/chats', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: body
    })
    .then(res => res.text())
    .then(data => {
        const chat = JSON.parse(data)
        
        window.location.href = `/messages/${chat._id}`
    })
})