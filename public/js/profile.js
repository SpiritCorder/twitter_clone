function createPinnedPost(post, largeFont=false) {
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



function fetchProfileUserPosts(profileUserId, selectedTab) {
    fetch(`/api/posts?postedBy=${profileUserId}&isReply=${selectedTab == 'replies' ? true : false}`, {method: 'GET'})
        .then(res => res.text())
        .then(data => {
            const posts = JSON.parse(data);
            postsContainer.innerHTML = "";

            for(let post of posts) {
                const html = createPost(post)

                postsContainer.append(html)

            }
        })
        .catch(err => console.log(err))
}

function fetchPinnedPost(profileUserId) {
    fetch(`/api/posts?postedBy=${profileUserId}&isPinned=true`)
        .then(res => res.text())
        .then(data => {
            const pinnedPost = JSON.parse(data);

            if(pinnedPost[0]) {
                const pinnedPostContainer = document.querySelector('.pinnedPostContainer')
                pinnedPostContainer.classList.add('visible');

                pinnedPostContainer.innerHTML = "";

                const html = createPinnedPost(pinnedPost[0])

                pinnedPostContainer.append(html)
            }
        })
        .catch(err => console.log(err))
}


document.addEventListener('DOMContentLoaded', () => {
    fetchProfileUserPosts(profileUserId, selectedTab)

    if(selectedTab != 'replies') {
        fetchPinnedPost(profileUserId)
    }
});

