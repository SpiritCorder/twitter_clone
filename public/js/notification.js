const notificationContainer = document.querySelector('.notificationContainer');
const markAllBtn = document.querySelector('.markAllAsRead');

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/notifications', {method: 'GET'})
        .then(res => res.json())
        .then(data => {
            outputNotificationList(data)
        })
        .catch(err => console.log(err))
})

markAllBtn.addEventListener('click', () => {
    markAsRead()
})



function outputNotificationList(notifications) {
    if(notifications.length === 0) return;

    notifications.forEach(notification => {
        const html = notificationHtml(notification)
        notificationContainer.append(html)
    })
}

// function notificationHtml(notification) {
//     const a = document.createElement('a');

//     const className = notification.opened ? 'notActive' : 'active';

//     a.classList.add("notification")
//     a.classList.add(className)

//     const userFrom = notification.userFrom;

//     const href = getNotificationUrl(notification);

//     a.setAttribute('href', href)

//     if(!notification.opened) {

//         a.addEventListener('click', (e) => {

//             e.preventDefault();
//             markAsRead(notification._id, () => {
//                 window.location.href = href
//             })
//         })
//     }

//     const text = getNotificationText(notification)

//     a.innerHTML = `
//         <div class="resultImageContainer">
//             <img src="${userFrom.profilePic}" alt="Profile Pic">
//         </div>
//         <div class="notificationDetailsContainer ellipsis">
//             <span>${text}</span>
//         </div>
//     `;

//     return a;
// }

// function getNotificationText(notification) {
//     const userFrom = notification.userFrom;

//     if(!userFrom.firstName || !userFrom.lastName) return alert("No user from data");

//     const name = userFrom.firstName + " " + userFrom.lastName;

//     let text;

//     if(notification.notificationType == "follow") {
//         text = `${name} is followed you`
//     } else if(notification.notificationType == "like") {
//         text = `${name} has liked to one of your post`
//     } else if(notification.notificationType == "retweet") {
//         text = `${name} has retweeted one of your post`
//     } else if(notification.notificationType == "reply") {
//         text = `${name} has replied one of your post`
//     } else {
//         return;
//     }

//     return text;
// }

// function getNotificationUrl(notification) {
//     let url;

//     if(notification.notificationType == "follow") {
//         url = `/profile/${notification.userFrom.username}`
//     } else if(notification.notificationType == "like" || notification.notificationType == "retweet" || notification.notificationType == "reply") {
//         url = `/posts/${notification.entityId}`
//     }

//     return url;
// }

// function markAsRead(notificationId=null, cb=null) {


//    const url = notificationId && cb ? `/api/notifications/${notificationId}` : '/api/notifications';

//    if(!cb) cb = () => window.location.reload()

//     fetch(url, {method: 'PUT'})
//         .then(res => res.text())
//         .then(data => cb())
//         .catch(err => console.log(err))
// }