const storage = {
  get: function (key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key]);
      });
    });
  },
  set: function (key, value) {
    return new Promise((resolve) => {
      const data = {};
      data[key] = value;
      chrome.storage.local.set(data, resolve);
    });
  },
};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "loading") {
    if (tab.url == "https://pinboard.in/add") {
      chrome.tabs.remove(tabId);
    }
  }
});

const selection_callbacks = [];
function getSelection(callback) {
  selection_callbacks.push(callback);

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs && tabs.length > 0) {
      const activeTab = tabs[0];

      chrome.scripting
        .executeScript({
          target: { tabId: activeTab.id, allFrames: false },
          files: ["js/getSelection.js"],
        })
        .catch((error) => {
          console.error("Error executing script:", error);
          // If there's an error, still call the callback with empty string
          if (selection_callbacks.length > 0) {
            const callback = selection_callbacks.shift();
            callback("");
          }
        });
    } else {
      if (selection_callbacks.length > 0) {
        const callback = selection_callbacks.shift();
        callback("");
      }
    }
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message && message.action === "getFromLocalStorage") {
    chrome.storage.local.get(message.variableName, function (result) {
      sendResponse(result[message.variableName]);
    });
    return true; // Required for async sendResponse
  }

  if (message && message.type === "testConnection") {
    sendResponse({
      status: "connected",
      message: "Background script is working",
    });
    return true;
  }

  if (message && message.type === "addPinboard") {
    try {
      addPinboard(message);
      sendResponse({ status: "processing" });
    } catch (error) {
      console.error("Error in addPinboard:", error);
      sendResponse({ status: "error", message: error.message });
    }
    return true; // Indicate we'll send a response asynchronously
  }

  if (typeof message === "string" && selection_callbacks.length > 0) {
    const callback = selection_callbacks.shift();
    callback(message);
    return true;
  }

  return false;
});

function addPinboard(conf) {
  const c = conf || {};
  const url = c.url || "";
  const title = c.title || "";
  const description = c.description || "";
  const w = c.width || 600;
  const h = c.height || 400;
  const pinboardUrl = "https://pinboard.in/add?";

  const fullUrl =
    pinboardUrl +
    "url=" +
    encodeURIComponent(url) +
    "&title=" +
    encodeURIComponent(title) +
    "&description=" +
    encodeURIComponent(description);

  chrome.windows.getCurrent(function (currentWindow) {
    let left = Math.floor(currentWindow.left + (currentWindow.width - w) / 2);
    let top = Math.floor(currentWindow.top + (currentWindow.height - h) / 2);

    left = Math.max(left, 0);
    top = Math.max(top, 0);

    chrome.windows.create(
      {
        url: fullUrl,
        width: w,
        height: h,
        left: left,
        top: top,
        type: "popup",
      },
      function (window) {
        if (!window || !window.tabs || window.tabs.length === 0) {
          console.error("Failed to create Pinboard window");
        }
      }
    );
  });
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
