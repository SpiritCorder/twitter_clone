document.addEventListener('DOMContentLoaded', e => {
    fetch(`/api/posts/${postId}`, {method: 'GET'})
        .then(res => res.text())
        .then(data => {
            const result = JSON.parse(data)
            
            if(result.replyTo) {
                let html = createPost(result.replyTo)
                postsContainer.append(html)

                html = createPost(result.post, true)
                postsContainer.append(html)

                if(result.replies.length) {
                   
                    result.replies.forEach(reply => {
                        html = createPost(reply);
                        postsContainer.append(html)
                    })
                }
            } else {
                let html = createPost(result.post, true)
                postsContainer.append(html)

                if(result.replies) {
                    result.replies.forEach(reply => {
                        html = createPost(reply)
                        postsContainer.append(html)
                    });
                }
            }
            
        })
        .catch(err => console.log(err))
})