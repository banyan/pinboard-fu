chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status == "loading") {
    if (tab.url == "https://pinboard.in/add") {
      chrome.tabs.remove(tabId);
    }
  }
});

chrome.extension.onMessage.addListener(
function(message, sender, sendResponse) {
  if (message.action && sender.tab) {
    switch (message.action) {
      case 'getFromLocalStorage':
      if (localStorage[message.variableName] !== null) {
        sendResponse(localStorage[message.variableName]);
      }
      break;
    }
  }
}
);

var selection_callbacks = [];
function getSelection(callback) {
  selection_callbacks.push(callback);
  chrome.tabs.executeScript(null, { file: "getSelection.js" });
};
chrome.extension.onMessage.addListener(function (request) {
  var callback = selection_callbacks.shift();
  callback(request);
});

(function() {
  chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type === 'addPinboard') {
        addPinboard(request);
      }
    }
  );

  addPinboard = function(conf) {
    var c       = conf || {},
      doc         = c.document || document,
      url         = c.url || doc.location,
      title       = c.title || doc.title,
      description = c.description || '',
      w           = c.width || 600,
      h           = c.height || 400,
      pinboardUrl = "https://pinboard.in/add?",
      fullUrl;

    fullUrl = pinboardUrl + 'url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title) + '&description=' + encodeURIComponent(description);

    chrome.windows.create({
      url: fullUrl,
      width:  w,
      height: h,
      left: (screen.width / 2) - (w / 2),
      top:  (screen.height / 2) - (h / 2),
      type: 'popup'
    }, function() {
    chrome.windows.getCurrent(function(window) {
      chrome.tabs.getSelected(window.id,
        function (response){
          ourWindow = response.id
        });
      });
    });
  };
})();
