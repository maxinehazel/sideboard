var accessToken

(async function () {
  accessToken = 'softpunk:D3B8053CA631C5166030'

  if (postsUpdated() === true) {
    getAllPosts().then((posts) => {
      storePosts(posts)
      let gettingItem = browser.storage.local.get("posts");
      gettingItem.then(updatePanel, onError);
    }, onError)
  } else {
    let gettingItem = browser.storage.local.get("posts");
    gettingItem.then(updatePanel, onError);
  }
})()


async function getAllPosts() {
  const url = 'https://api.pinboard.in/v1/posts/all?auth_token=' + accessToken + '&format=json';
  const response = await fetch(url);
  const json = await response.json();
  return json
}

function storePosts(posts) {
  browser.storage.local.set({ posts })
    .then(setItem, onError);
}

function onError(error) {
  console.log(error);
}

function setItem() {
  console.log("OK");
}

function updatePanel(item) {
  console.log(item);
}

function postsUpdated() {
  return true
}