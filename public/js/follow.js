function fetchProfileUserFollowData(profileUserId, selectedTab, followDataContainer) {
    fetch(`/api/users/${profileUserId}?data=${selectedTab == 'followers' ? 'followers' : 'followings'}`, {method: 'GET'})
        .then(res => res.text())
        .then(data => {
            const followData = JSON.parse(data);

            followDataContainer.innerHTML = "";
            
            if(selectedTab == 'followers') {
                followData.followers && followData.followers.forEach(follower => {
                    const html = createUser(follower, true);
                    followDataContainer.append(html)
                });

                if(followData.followers.length == 0) {
                    followDataContainer.innerHTML = "<span class='noFollowData'>No followers found</span>"
                }
            } else {
                followData.followings && followData.followings.forEach(following => {
                    const html = createUser(following, true);
                    followDataContainer.append(html)
                })

                if(followData.followings.length == 0) {
                    followDataContainer.innerHTML = "<span class='noFollowData'>No followings found</span>"
                }
            }

        })
        .catch(err => console.log(err))
}


document.addEventListener('DOMContentLoaded', () => {
    const followDataContainer = document.querySelector('.followDataContainer');
    fetchProfileUserFollowData(profileUserId, selectedTab, followDataContainer)
});
