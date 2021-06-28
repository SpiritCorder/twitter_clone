const searchInput = document.getElementById('searchInput');
const searchResultsContainer = document.querySelector('.searchResultsContainer');

let id;

function fetchSearchData(val) {

    console.log('called', val)

    const route = selectedTab === 'posts' ? 'posts' : selectedTab === 'users' ? 'users' : 'posts';

    const query = route === 'posts' ? 'content' : 'username';

    fetch(`/api/${route}?${query}=${val}`, {
        method: 'GET'
    })
    .then(res => res.text())
    .then(data => {
        const results = JSON.parse(data);

        searchResultsContainer.innerHTML = "";

        if(results.length === 0) {
            searchResultsContainer.innerHTML = `<p class='noResult'>No search result found</p>`
        }

        if(route === 'posts' && results.length > 0) {
            results.forEach(post => {
                const html = createPost(post);

                searchResultsContainer.append(html)
            })
        }

        if(route === 'users') {
            results.forEach(user => {
                const html = createUser(user, true)

                searchResultsContainer.append(html);
            })
        }
    })
    .catch(err => console.log(err))

}



const getSearchResult = (e) => {
    const val = e.target.value.trim();
    
    if(id) {
        clearTimeout(id)
    }

    id = setTimeout(() => {
        if(val === "") {
            return;
        } else {
            fetchSearchData(val)
        }
        
    }, 1000)
    
}

searchInput.addEventListener('input', getSearchResult)