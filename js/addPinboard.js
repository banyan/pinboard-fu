(function() {
  var localSettings = {
    bookmarkKeyChar:    'D',
    bookmarkSpecialKey: 'alt'
  };

  function getVariableFromLocalStorage(variableName, defaultValue) {
    localSettings[variableName] = defaultValue;
    var onResponse = function (response) {
      if (response !== null) {
        localSettings[variableName] = response;
      }
    }
    chrome.runtime.sendMessage({'action': 'getFromLocalStorage', 'variableName': variableName}, onResponse);
  }

  getVariableFromLocalStorage('bookmarkKeyChar', localSettings.bookmarkKeyChar);
  getVariableFromLocalStorage('bookmarkSpecialKey', localSettings.bookmarkSpecialKey);

	// Listen for key press
  window.addEventListener(
    'keydown',
    function(e) {
      if ((e.which == localSettings.bookmarkKeyChar.charCodeAt(0))
        && (
          (localSettings.bookmarkSpecialKey == 'alt' && e.altKey)
          || (localSettings.bookmarkSpecialKey == 'ctrl' && e.ctrlKey)
          || (localSettings.bookmarkSpecialKey == 'meta' && e.metaKey)
      )) {
        // prevent the default, doesn't seem to overwrite the windows (Meta) key
        e.preventDefault();
        addPinboardFromContentScript();
      }
    },
    false
  );

  addPinboardFromContentScript = function() {
    var url = document.location.toString(),
      title = document.title,
      description = '';

    if (window && window.getSelection) {
      description = window.getSelection().toString();
    } else if (document && document.getSelection) {
      description = document.getSelection().toString();
    }

    chrome.runtime.sendMessage({
      type:  'addPinboard',
      url:   url,
      title: title,
      description: description
    });
  };
})();
