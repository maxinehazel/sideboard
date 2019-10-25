var accessToken

const accessTokenNotFound = "<p>Configure API Token in the extension options on the about:addons page.</p>";

(async function () {
  accessToken = await getAccessToken()
  var update = await postsUpdated()
  if (update === true) {
    getAllPosts().then((posts) => {
      storePosts(posts).then(function () {
        browser.storage.local.get().then(updatePanel, onError);
      })
    }, onError)
  } else {
    browser.storage.local.get().then(updatePanel, onError);
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
  await browser.storage.local.set({ "posts": formattedPosts })
    .then(function () {
      return
    }, onError);
}

function updatePanel(meta) {
  var posts = meta.posts
  var html = postHTML(posts)
  document.getElementById("list").innerHTML = html
  var toggler = document.getElementsByClassName("caret");
  var i;

  for (i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener("click", function () {
      this.parentElement.querySelector(".nested").classList.toggle("active");
      this.classList.toggle("caret-down");
    });
  }

}

function postHTML(posts) {
  var html = `<ul id="tagMenu">`
  for (var tag in posts) {
    html += `<li><span class="caret"><a href="#">${tag}</a></span>`
    html += `<ul class="nested">`
    var postList = posts[tag]
    for (var x = 0; x < postList.length; x++) {
      var post = postList[x]
      html += `<li><a href="${post.href}">${post.description}</a></li>`
    }
    html += `</ul>`
    html += `</li>`
  }
  html += `</ul>`
  return html
}

async function postsUpdated() {
  var time = await getUpdatedTime()
  return new Promise(resolve => {
    var updatedTime = time.update_time
    browser.storage.local.get("updated_at").then(function (storedTime) {
      if (storedTime.updated_at === updatedTime) {
        resolve(false)
      } else {
        browser.storage.local.set({ "updated_at": updatedTime })
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


function oncClick() {
  console.log("test")
}

function onError(error) {
  console.log(error);
}

function setItem() {
  console.log("OK");
}