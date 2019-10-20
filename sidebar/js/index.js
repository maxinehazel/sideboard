var accessToken

(async function () {
  accessToken = 'softpunk:D3B8053CA631C5166030'
  var update = await postsUpdated()
  if (update === true) {
    console.log("fetched from pinboard.in")
    getAllPosts().then((posts) => {
      storePosts(posts).then(function () {
        browser.storage.local.get("posts").then(updatePanel, onError);
      })
    }, onError)
  } else {
    console.log("fetched from local storage")
    browser.storage.local.get("posts").then(updatePanel, onError);
  }
})()


async function getAllPosts() {
  const url = 'https://api.pinboard.in/v1/posts/all?auth_token=' + accessToken + '&format=json';
  const response = await fetch(url);
  const json = await response.json();
  return json
}

async function getUpdatedTime() {
  const url = 'https://api.pinboard.in/v1/posts/update?auth_token=' + accessToken + '&format=json';
  const response = await fetch(url);
  const json = await response.json();
  return json
}

async function storePosts(posts) {
  await browser.storage.local.set({ posts })
    .then(function () {
      console.log("OK")
      return
    }, onError);
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

async function postsUpdated() {
  var time = await getUpdatedTime()
  return new Promise(resolve => {
    var updatedTime = time.update_time
    console.log("updated time: " + updatedTime)
    browser.storage.local.get("updated_at").then(function (storedTime) {
      console.log("stored time: " + storedTime.updated_at)
      if (storedTime.updated_at === updatedTime) {
        console.log("updated time not changed")
        resolve(false)
      } else {
        console.log("updated time changed")
        browser.storage.local.set({ "updated_at": updatedTime })
          .then(setItem, onError);
        resolve(true)
      }
    }, onError);
  })
}