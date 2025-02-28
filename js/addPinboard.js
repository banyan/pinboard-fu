(function () {
  const localSettings = {
    bookmarkKeyChar: "D",
    bookmarkSpecialKey: "alt",
  };

  function getFromLocalStorage(variableName, defaultValue) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: "getFromLocalStorage", variableName: variableName },
        function (response) {
          if (response !== null && response !== undefined) {
            resolve(response);
          } else {
            resolve(defaultValue);
          }
        }
      );
    });
  }

  async function initialize() {
    try {
      localSettings.bookmarkKeyChar = await getFromLocalStorage(
        "bookmarkKeyChar",
        localSettings.bookmarkKeyChar
      );

      localSettings.bookmarkSpecialKey = await getFromLocalStorage(
        "bookmarkSpecialKey",
        localSettings.bookmarkSpecialKey
      );

      window.addEventListener(
        "keydown",
        function (e) {
          // Check for Alt+D, including special case for delta symbol (∂)
          if (
            (e.key.toUpperCase() === localSettings.bookmarkKeyChar ||
              e.key === "∂" || // Delta symbol that appears when pressing Alt+D on some keyboards
              e.code === "KeyD") && // D key code using standard code property
            ((localSettings.bookmarkSpecialKey === "alt" && e.altKey) ||
              (localSettings.bookmarkSpecialKey === "ctrl" && e.ctrlKey) ||
              (localSettings.bookmarkSpecialKey === "meta" && e.metaKey))
          ) {
            e.preventDefault();
            addPinboardFromContentScript();
          }
        },
        true // Using capturing phase
      );
    } catch (error) {
      console.error("Error initializing pinboard-fu:", error);
    }
  }

  initialize();

  function addPinboardFromContentScript() {
    const url = document.location.toString();
    const title = document.title;
    let description = "";

    if (window && window.getSelection) {
      description = window.getSelection().toString();
    } else if (document && document.getSelection) {
      description = document.getSelection().toString();
    }

    chrome.runtime.sendMessage(
      {
        type: "addPinboard",
        url: url,
        title: title,
        description: description,
      },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
        }
      }
    );
  }
})();
