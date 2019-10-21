var accessToken

const accessTokenNotFound = "<p>Configure API Token in the extension options on the about:addons page.</p>";

(async function () {
  accessToken = await getAccessToken()
  var update = await postsUpdated()
  if (update === true) {
    getAllPosts().then((posts) => {
      storePosts(posts).then(function () {
        browser.storage.sync.get().then(updatePanel, onError);
      })
    }, onError)
  } else {
    browser.storage.sync.get().then(updatePanel, onError);
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
  var formattedPosts = arrangePostsByTag(posts)
  await browser.storage.sync.set({ "posts": formattedPosts })
    .then(function () {
      return
    }, onError);
}

function updatePanel(meta) {
  var posts = meta.posts
  console.log(posts)
  document.getElementById("list").innerHTML = "Test"
}

async function postsUpdated() {
  var time = await getUpdatedTime()
  return new Promise(resolve => {
    var updatedTime = time.update_time
    browser.storage.sync.get("updated_at").then(function (storedTime) {
      if (storedTime.updated_at === updatedTime) {
        resolve(false)
      } else {
        browser.storage.sync.set({ "updated_at": updatedTime })
          .then(setItem, onError);
        resolve(true)
      }
    }, onError);
  })
}

function arrangePostsByTag(posts) {
  var postsByTags = new Object()
  postsByTags.untagged = Array()
  for (var x = 0; x < posts.length; x++) {
    post = posts[x]
    if (post.tags === "") {
      postsByTags.untagged.push(post)
    } else {
      var tagList = post.tags
      var tags = tagList.split(' ');
      for (var y = 0; y < tags.length; y++) {
        var tag = tags[y]
        if (tag in postsByTags) {
          postsByTags[tag].push(post)
        } else {
          postsByTags[tag] = Array()
          postsByTags[tag].push(post)
        }
      }
    }
  }
  return postsByTags
}

async function getAccessToken() {
  return new Promise(resolve => {
    browser.storage.sync.get("pinboard_access_token").then(function (storedToken) {
      if (storedToken.pinboard_access_token === undefined) {
        document.getElementById("list").innerHTML = accessTokenNotFound;
        resolve(undefined)
      } else {
        resolve(storedToken.pinboard_access_token)
      }
    }, onError);
  })
}

function onError(error) {
  console.log(error);
}

function setItem() {
  console.log("OK");
}