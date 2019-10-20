var accessToken

function updateContent() {
  accessToken = 'softpunk:D3B8053CA631C5166030'
  const url = 'https://api.pinboard.in/v1/posts/all?auth_token=' + accessToken + '&format=json';
  fetch(url, {
    mode: 'no-cors'
  }).then(response => response.ok)
    .then(data => {
      console.log(data)
    })
    .catch(error => console.error(error))
}

browser.tabs.onActivated.addListener(updateContent);

browser.tabs.onUpdated.addListener(updateContent);

browser.windows.getCurrent({ populate: true }).then((windowInfo) => {
  updateContent();
});
