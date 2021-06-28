document.addEventListener('DOMContentLoaded', () => {
    refreshMessagesBadge()
    refreshNotificationsBadge()
})



const textareaPost = document.getElementById('postContent');
const textareaReply = document.getElementById('replyContent');
const postBtn = document.getElementById('postBtn');
const replyBtn = document.getElementById('replyBtn');
const deleteBtn = document.getElementById('deleteBtn');
const postsContainer = document.querySelector('.postsContainer');
const replyPostContainer = document.querySelector('.replyPostContainer');
const fileInput = document.getElementById('fileInput');
const fileInputCover = document.getElementById('fileInputCover');
const uploadBtn = document.getElementById('uploadBtn');
const uploadCoverBtn = document.getElementById('uploadCoverBtn');
const pinBtn = document.getElementById('pinnedPostBtn');

// Globals
let cropper;

// Go to single post view page
if(postsContainer) {
    postsContainer.addEventListener('click', e => {
        if(e.target.classList.contains('post')) {
            const postId = getRootElement(e.target);
            
            window.location.href = `/posts/${postId}`;
        }
    })
}

function getRootElement(element) {
    const isRoot = element.classList.contains('post');
    const rootElem = isRoot ? element : element.parentElement.parentElement.parentElement.parentElement.parentElement;
    const postId = rootElem.getAttribute("post-id");

    return postId;
}

// Hndle Retweet Button Click

document.addEventListener('click', e => {
    if(e.target.classList.contains('retweetBtn')) {
        const button = e.target;
        const postId = getRootElement(button);

        fetch(`/api/posts/${postId}/retweet`, {
            method: 'POST'
        })
        .then(res => res.text())
        .then(data => {
            const post = JSON.parse(data);
            const span = button.querySelector('span');
            span.innerText = post.retweetUsers.length || "";

            const isRetweeted = post.retweetUsers.includes(authUser._id);

            if(isRetweeted) {
                button.classList.add('active');
                if(post.postedBy != authUser._id) {
                    emitNotificationEvent(post.postedBy)
                }
            } else {
                button.classList.remove('active');
            }

        })
        .catch(err => console.log(err))
    }

})

// Handle Like Button Click

document.addEventListener('click', (e) => {
    if(e.target.classList.contains('likeBtn')) {
        
        const button = e.target;
        const postId = getRootElement(button)

        fetch(`/api/posts/${postId}/like`, {method: 'PUT'})
            .then(res => res.text())
            .then(data => {
                const post = JSON.parse(data);
                const span = button.querySelector('span');
                span.innerText = post.likes.length || "";

                const isLiked = post.likes.findIndex(item => item === authUser._id);

                if(isLiked >= 0) {
                    button.classList.add('active')

                    if(post.postedBy != authUser._id) {
                        emitNotificationEvent(post.postedBy)
                    }
                } else {
                    button.classList.remove('active');
                }

            })
            .catch(err =>console.log(err))
    }
})

// Handle Time Differences

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30 ) return 'Just now';
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}


function createPost(post, largeFont = false) {

    const purePostId = post._id;

    let pinBtnClass = '';
    if(post.postedBy._id == authUser._id && post.pinned) {
        
        pinBtnClass = 'pinned';
    }

    const isRetweetedPost =  post.retweetData ? true : false;
    const retweetedBy = isRetweetedPost ? post.postedBy.username : null;
    post = isRetweetedPost ? post.retweetData : post;

    const postedBy = post.postedBy;
    const displayName = postedBy.firstName + " " + postedBy.lastName;
    const timestamp = timeDifference(new Date(), new Date(post.createdAt));
    

    const isLiked = post.likes.includes(authUser._id);
    const isRetweeted = post.retweetUsers.includes(authUser._id);

    let retweetedByText = '';
    if(isRetweetedPost) {
        retweetedByText = `
            <span>Retweeted By <a href="/profile/${retweetedBy}">@${retweetedBy}</a></span>
        `;
    }

    let replyIndicate = "";
    if(post.replyTo && post.replyTo._id) {
        if(!post.replyTo._id) return alert('ReplyTo is not populated!');

        if(!post.replyTo.postedBy._id) return alert('ReplyTo postedBy is not populated!');
    
        const replyToUsername = post.replyTo.postedBy.username;

        replyIndicate = `
            <div class="replyIndicate">
                Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
            </div>
        `;
    
    }

   

    const div = document.createElement('div');
    div.classList.add('post');
    div.setAttribute("post-id", post._id);
    div.innerHTML = `
        ${post.postedBy._id === authUser._id ? `<button post-id="${purePostId}" class="pinBtn ${pinBtnClass}" data-toggle="modal" data-target="#pinnedPostModal"><i class="fas fa-thumbtack"></i></button>` : ''}
        ${post.postedBy._id === authUser._id ? `<button post-id="${post._id}" class="deleteBtn" data-toggle="modal" data-target="#deleteModal"><i class="fas fa-trash"></i></button>` : ''}
        <div class="retweetDetails">
            ${retweetedByText}
        </div>
        <div class="mainContentContainer ${largeFont ? 'largeFont' : ''}">
            <div class="profilePicContainer">
                <img src="${postedBy.profilePic}" alt="Image" >
            </div>
            <div class="postContentContainer">
                <div class="header">
                    <a class="displayName" href="/profile/${postedBy.username}">${displayName}</a>
                    <span class="username">@${postedBy.username}</span>
                    <span class="date">${timestamp}</span>
                </div>
                ${replyIndicate}
                <div class="postBody">
                    <span>${post.content}</span>
                </div>
                <div class="postFooter">
                    <div class="postButtonContainer">
                        <button data-toggle="modal" data-target="#replyModal"><i class="far fa-comment"></i></button>
                    </div>
                    <div class="postButtonContainer green">
                        <button class="retweetBtn ${isRetweeted ? 'active' : ''}">
                            <i class="fas fa-retweet"></i>
                            <span>${post.retweetUsers.length || ""}</span>
                        </button>
                    </div>
                    <div class="postButtonContainer red">
                        <button class='likeBtn ${isLiked ? 'active' : ''}'>
                            <i class="far fa-heart" id="heart"></i>
                            <span class="totalLikes">${post.likes.length || ""}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    return div;

}

// Disable post button
if(textareaPost) {
    textareaPost.addEventListener('input', e => {
        console.log('working')
        if(e.target.value.trim() !== "") {
            postBtn.removeAttribute("disabled");
        } else {
            postBtn.setAttribute("disabled", true);
        }
    })
}

// Disable reply button
if(textareaReply) {
    textareaReply.addEventListener('input', e => {
        if(e.target.value.trim() !== "") {
            replyBtn.removeAttribute("disabled");
        } else {
            replyBtn.setAttribute("disabled", true);
        }
    })
}

// Create a post
if(postBtn) {
    postBtn.addEventListener('click', () => {
        if(textareaPost.value.trim() === "") {
            alert("Please add some content to create a post");
        }

        const data = {
            content: textareaPost.value
        };

        fetch("/api/posts", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.text())
            .then(data => {
                textareaPost.value = "";

                postBtn.setAttribute("disabled", true)
                const post = JSON.parse(data);

                const html = createPost(post);

                postsContainer.prepend(html);
            })
            .catch(err => {
                console.log(err)
            })
    });
}

// Create a Reply Post
if(replyBtn) {
    replyBtn.addEventListener('click', e => {
        const reply = textareaReply.value;

        if(reply.trim() === "") {
            return alert('Please add some text');
        }

        const postId = e.target.parentElement.parentElement.querySelector('.post').getAttribute('post-id');

        if(!postId) return alert("No post id to send the request");

        const data = {
            reply,
            postId
        };

        fetch("/api/posts", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.text())
            .then(data => {

                const reply = JSON.parse(data)

                const originalPost = reply.replyTo;

                if(originalPost.postedBy._id != authUser._id) {
                    emitNotificationEvent(originalPost.postedBy._id);
                }

                window.location.reload();
                
            })
            .catch(err => {
                console.log(err)
            })

        
    })

    // // Fetching replyModal post data
    $("#replyModal").on("show.bs.modal", e => {
        const button = e.relatedTarget;
        const postId = getRootElement(button);

        fetch(`/api/posts/${postId}`, {method: 'GET'})
            .then(res => res.text())
            .then(data => {

                const result = JSON.parse(data);
                const html = createPost(result.post);
                replyPostContainer.innerHTML = "";
                replyPostContainer.append(html);
            })
            .catch(err => console.log(err))
    });
}

// Removing the inner HTML when modal closes
$("#replyModal").on("hidden.bs.modal", e => {
    
    replyPostContainer.innerHTML = "";
});


$("#deleteModal").on("show.bs.modal", e => {
    const button = e.relatedTarget;
    const postId = button.getAttribute('post-id');

    deleteBtn.setAttribute('post-id', postId);
});

// Hnadle delete post
if(deleteBtn) {
    deleteBtn.addEventListener('click', e => {
        
        const postId = e.target.getAttribute('post-id');

        fetch(`/api/posts/${postId}`, {method: 'DELETE'})
            .then(res => res.text())
            .then(data => {
                console.log(data)
                window.location.reload()
            })
            .catch(err => console.log(err))

        // const posts = Array.from(postsContainer.querySelectorAll('.post'))
            
        // for(let elem of posts) {

        //     const elemId = elem.getAttribute("post-id").toString();
        //     if(elemId === postId) {
        //         postsContainer.removeChild(elem)
        //         break;
        //     }
        // }

        // window.location.reload();
        
    })
}


// Follow Button Handler
document.addEventListener('click', e => {
    if(e.target.classList.contains('followBtn')) {
        const profileUserId = e.target.getAttribute('user-data');
        
        fetch(`/api/users/${profileUserId}/follow`, {method: 'PUT'})
            .then(res => res.text())
            .then(data => {
                const userData = JSON.parse(data);

                const span = document.getElementById('totalFollowers');

                let count;
                if(span) {
                    count = +span.innerText;
                }

                const isFollowing = userData.followings && userData.followings.includes(profileUserId);

                if(isFollowing) {
                    
                    e.target.innerText = 'Following';
                    e.target.classList.add('following')

                    if(span) {
                        span.innerText = ++count;
                    }

                    emitNotificationEvent(profileUserId)
                    

                } else {
                    e.target.innerText = 'Follow';
                    e.target.classList.remove('following')
                    if(span) {
                        span.innerText = --count;
                    }
                    
                }
            })
            .catch(err =>console.log(err))
    }
})

function createUser(user, showFollowButton) {

    const div = document.createElement('div');
    div.classList.add('user')

    const alreadyFollowing = authUser.followings && authUser.followings.includes(user._id);

    const text = alreadyFollowing ? 'Following' : 'Follow';
    const buttonClass = alreadyFollowing ? 'followBtn following' : 'followBtn';

    let followButton = "";

    if(showFollowButton && authUser._id != user._id) {
        followButton = `
            <div>
                <button class='${buttonClass}' user-data='${user._id}'>${text}</button>
            </div>
        `;
    }

    const name = user.firstName + " " + user.lastName;

    div.innerHTML =  `
        <div class="profilePicContainer">
            <img src="${user.profilePic}" alt="User Image" >
        </div>
        <div class="userDetailsContainer">
            <div class="header">
                <a href="/profile/${user.username}">${name}</a>
                <span class="username">@${user.username}</span>
            </div>
        </div>
        ${followButton}
    `;

    return div;
}

// Image upload
if(fileInput) {
    fileInput.addEventListener('change', e => {
        
        const imageData = e.target.files;

        if(imageData && imageData[0]) {
            const reader = new FileReader()

            reader.onload = (e) => {
                const imagePreview = document.getElementById('imagePreview')

                imagePreview.setAttribute('src', e.target.result)

                if(cropper) {
                    cropper.destroy()
                }

                cropper = new Cropper(imagePreview, {
                    aspectRatio: 1/ 1,
                    background: false
                })

                
            }

            reader.readAsDataURL(imageData[0])
        }
    });
}

if(uploadBtn) {
    uploadBtn.addEventListener('click', e => {
        
        if(!cropper) {
            return alert("There is no inage to upload. Try again!")
        }

        const canvas = cropper.getCroppedCanvas();

        canvas.toBlob(blob => {
            const formData = new FormData()

            formData.append("croppedImage", blob)

            fetch('/api/users/image', {
                method: 'PUT',
                body: formData
            })
            .then(res => res.text())
            .then(data => window.location.reload())
            .catch(err  => console.log(err) )
        })

    })
}

if(fileInputCover) {
    fileInputCover.addEventListener('change', e => {

        const coverPhoto = e.target.files;

        if(!coverPhoto || !coverPhoto[0]) {
            alert("No cover photo selected!")
        }

        const reader = new FileReader();

        reader.onload = e => {

            const imagePreview = document.getElementById('imagePreviewCover');

            imagePreview.setAttribute('src', e.target.result)

            if(cropper) {
                cropper.destroy()
            }

            cropper = new Cropper(imagePreview, {
                aspectRatio: 16 / 9,
                background: false
            })
        }

        reader.readAsDataURL(coverPhoto[0])
    })
}

if(uploadCoverBtn) {
    uploadCoverBtn.addEventListener('click', e => {
        if(!cropper) {
            return alert("No cover photo to upload");
        }

        const canvas = cropper.getCroppedCanvas();

        canvas.toBlob(blob => {
            const formData = new FormData();

            formData.append('croppedCoverImage', blob)

            fetch('/api/users/cover', {method: 'PUT', body: formData})
                .then(res => res.text())
                .then(data => window.location.reload())
                .catch(err => console.log(err))
        })
    })
}

// Pin Button handling

$("#pinnedPostModal").on("show.bs.modal", e => {
    const button = e.relatedTarget;
    const postId = button.getAttribute('post-id');

    pinBtn.setAttribute('post-id', postId);
});

if(pinBtn) {
    pinBtn.addEventListener('click', e => {
        const postId = e.target.getAttribute('post-id');

        if(!postId) {
            return alert("Post id is missing can't pin post!");
        }

        fetch(`/api/posts/${postId}/pinned`, {method: 'GET'})
            .then(res => res.text())
            .then(data => window.location.reload())
            .catch(err => console.log(err))
    })
}

function receivedMessageHandler(newMessage) {
    const isChatPage = document.querySelector('.chatPageContent');

    if(!isChatPage) {

        // TODO
        const notificationList = document.getElementById('notificationList')

        if(!newMessage.chat.latestMessage._id) {
            newMessage.chat.latestMessage = newMessage
        }

        const html = createChatHtml(newMessage.chat)
        notificationList.prepend(html)

        setTimeout(() => {
            html.remove()
        }, 4000)

    } else {
        

        if(chatId != newMessage.chat._id) {
            const notificationList = document.getElementById('notificationList')

            if(!newMessage.chat.latestMessage._id) {
                newMessage.chat.latestMessage = newMessage
            }

            const html = createChatHtml(newMessage.chat)
            notificationList.prepend(html)

            setTimeout(() => {
                html.remove()
            }, 4000)
        } else {

            const html = createMessageHtml(newMessage)
            renderMessagesToPage(html)
        }
    }

    refreshMessagesBadge()
}

function refreshMessagesBadge() {
    fetch('/api/chats?badgesOnly=true', {method: 'GET'})
        .then(res => res.json())
        .then(data => {
            const messageBadge = document.getElementById('messageBadge');
            if(data.length > 0) {
                messageBadge.classList.add('active')
                messageBadge.innerText = data.length;
            } else {
                messageBadge.classList.remove('active')
                messageBadge.innerText = ""
            }
        })
        .catch(err => console.log(err))
        
}

function refreshNotificationsBadge() {
    fetch('/api/notifications?badgesOnly=true', {method: 'GET'})
        .then(res => res.json())
        .then(data => {
            const notificationBadge = document.getElementById('notificationBadge');
            if(data.length > 0) {
                notificationBadge.classList.add('active')
                notificationBadge.innerText = data.length;
            } else {
                notificationBadge.classList.remove('active')
                notificationBadge.innerText = "";
            }
        })
        .catch(err => console.log(err))
}

function showNotifications(data) {
    const notificationList = document.getElementById('notificationList')

    const html = notificationHtml(data)

    notificationList.prepend(html)

    setTimeout(() => {
        html.remove()
    }, 4000)
}


function notificationHtml(notification) {
    const a = document.createElement('a');

    const className = notification.opened ? 'notActive' : 'active';

    a.classList.add("notification")
    a.classList.add(className)

    const userFrom = notification.userFrom;

    const href = getNotificationUrl(notification);

    a.setAttribute('href', href)

    if(!notification.opened) {

        a.addEventListener('click', (e) => {

            e.preventDefault();
            markAsRead(notification._id, () => {
                window.location.href = href
            })
        })
    }

    const text = getNotificationText(notification)

    a.innerHTML = `
        <div class="resultImageContainer">
            <img src="${userFrom.profilePic}" alt="Profile Pic">
        </div>
        <div class="notificationDetailsContainer ellipsis">
            <span>${text}</span>
        </div>
    `;

    return a;
}

function getNotificationText(notification) {
    const userFrom = notification.userFrom;

    if(!userFrom.firstName || !userFrom.lastName) return alert("No user from data");

    const name = userFrom.firstName + " " + userFrom.lastName;

    let text;

    if(notification.notificationType == "follow") {
        text = `${name} is followed you`
    } else if(notification.notificationType == "like") {
        text = `${name} has liked to one of your post`
    } else if(notification.notificationType == "retweet") {
        text = `${name} has retweeted one of your post`
    } else if(notification.notificationType == "reply") {
        text = `${name} has replied one of your post`
    } else {
        return;
    }

    return text;
}

function getNotificationUrl(notification) {
    let url;

    if(notification.notificationType == "follow") {
        url = `/profile/${notification.userFrom.username}`
    } else if(notification.notificationType == "like" || notification.notificationType == "retweet" || notification.notificationType == "reply") {
        url = `/posts/${notification.entityId}`
    }

    return url;
}

function markAsRead(notificationId=null, cb=null) {


   const url = notificationId && cb ? `/api/notifications/${notificationId}` : '/api/notifications';

   if(!cb) cb = () => window.location.reload()

    fetch(url, {method: 'PUT'})
        .then(res => res.text())
        .then(data => cb())
        .catch(err => console.log(err))
}



// Message Notifications

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

function createImageHtml(url) {
    return `<img src="${url}" alt="chat-Image">`
}

function getImage(chat) {

    const output = {
        html: "",
        class: ""
    }

    console.log(chat)
    
    
    if(chat.users.length == 1) {
        output.html = createImageHtml(chat.users[0].profilePic);
        
    } else {

        
        const otherUsers = chat.users.filter(user => user._id != authUser._id);
        if(otherUsers.length > 1) {
            let result = createImageHtml(otherUsers[0].profilePic)
            result += createImageHtml(otherUsers[1].profilePic)

            output.html = result
            output.class = "double"
           
        } else {
            output.html = createImageHtml(otherUsers[0].profilePic)
            
        }   


    }

    return output;
}

function getLatestMessage(latestMessage) {
    if(latestMessage) {

        const name = latestMessage.sender.firstName + " " + latestMessage.sender.lastName;

        return `${name}: ${latestMessage.content}`
    }

    return 'New Chat';
}

function createChatHtml(chat) {
    const div = document.createElement('div');
    div.classList.add('chat');

    const chatName = getChatName(chat);
    const image = getImage(chat);

    const latestMessage = getLatestMessage(chat.latestMessage);

    const imageContainer = `
        <div class="chatImageContainer ${image.class}">
            ${image.html}
        </div>
    `;


    div.innerHTML = `
        <a href='/messages/${chat._id}'>
            ${imageContainer}
            <div class="chatDetailsContainer ellipsis">
                <span class="header ellipsis">${chatName}</span>
                <span class="subText ellipsis">${latestMessage}</span>
            </div>
        </a>
    `;

    return div;
}
