function startPopup() {
  // In Manifest V3, we can't use getBackgroundPage with service workers
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const activeTab = tabs[0];

      chrome.scripting
        .executeScript({
          target: { tabId: activeTab.id, allFrames: false },
          files: ['js/getSelection.js'],
        })
        .catch((error) => {
          console.error('Error executing selection script:', error);
          // If there's an error, still try to add the bookmark without selection
          addPinboardFromPopup('');
        });

      chrome.runtime.onMessage.addListener(function listener(message) {
        if (typeof message === 'string') {
          chrome.runtime.onMessage.removeListener(listener);
          addPinboardFromPopup(message);
        }
      });
    } else {
      // No active tab
      addPinboardFromPopup('');
    }
  });
}

function addPinboardFromPopup(description) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const tab = tabs[0];
      chrome.runtime.sendMessage(
        {
          type: 'addPinboard',
          url: tab.url,
          title: tab.title,
          description: description,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
          } else {
            window.close();
          }
        }
      );
    }
  });
}

window.addEventListener('load', startPopup);
