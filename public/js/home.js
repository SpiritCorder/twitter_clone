// const postsContainer = document.querySelector('.postsContainer');

// function createPost(post) {

//     const postedBy = post.postedBy;
//     const displayName = postedBy.firstName + " " + postedBy.lastName;
//     const timestamp = "To do later";

//     const div = document.createElement('div');
//     div.classList.add('post');
//     div.innerHTML = `
//         <div class="mainContentContainer">
//             <div class="profilePicContainer">
//                 <img src="${postedBy.profilePic}" alt="Image" >
//             </div>
//             <div class="postContentContainer">
//                 <div class="header">
//                     <a class="displayName" href="/profile/${postedBy.username}">${displayName}</a>
//                     <span class="username">@${postedBy.username}</span>
//                     <span class="date">${timestamp}</span>
//                 </div>
//                 <div class="postBody">
//                     <span>${post.content}</span>
//                 </div>
//                 <div class="postFooter">
//                     <div class="postButtonContainer">
//                         <button><i class="far fa-comment"></i></button>
//                     </div>
//                     <div class="postButtonContainer">
//                         <button><i class="fas fa-retweet"></i></button>
//                     </div>
//                     <div class="postButtonContainer">
//                         <button><i class="far fa-hart"></i></button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;

//     return div;

// }


function fetchPosts() {

    fetch("/api/posts?followingOnly=true", {
    method: 'GET'
    })
    .then(res => res.text())
    .then(data => {
        const posts = JSON.parse(data);
        postsContainer.innerHTML = "";
        
        posts.forEach(post => {
            
            const html = createPost(post);
            postsContainer.append(html);
        })
    })
    .catch(err => {
       
        console.log(err)
    })
}



document.addEventListener("DOMContentLoaded", function(){
   
    fetchPosts()
});