document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener("load", function () {
    chrome.storage.local.get(
      ["bookmarkKeyChar", "bookmarkSpecialKey"],
      function (items) {
        const bookmarkKeyCharInput = document.getElementById("bookmarkKeyChar");
        const bookmarkSpecialKeySelect =
          document.getElementById("bookmarkSpecialKey");

        if (items.bookmarkKeyChar) {
          bookmarkKeyCharInput.value = items.bookmarkKeyChar;

          if (
            items.bookmarkSpecialKey === null ||
            items.bookmarkSpecialKey === undefined
          ) {
            bookmarkSpecialKeySelect.value = "alt"; // Default to alt
          } else {
            bookmarkSpecialKeySelect.value = items.bookmarkSpecialKey;
          }
        } else {
          // Set defaults if no saved options
          bookmarkKeyCharInput.value = "D";
          bookmarkSpecialKeySelect.value = "alt";
        }
      }
    );
  });

  document
    .getElementById("save_options")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const bookmarkKeyChar = document.getElementById("bookmarkKeyChar").value;
      const bookmarkSpecialKey =
        document.getElementById("bookmarkSpecialKey").value;
      const messageDiv = document.getElementById("message");

      chrome.storage.local.set(
        {
          bookmarkKeyChar: bookmarkKeyChar,
          bookmarkSpecialKey: bookmarkSpecialKey,
        },
        function () {
          // Check if save was successful
          chrome.storage.local.get(
            ["bookmarkKeyChar", "bookmarkSpecialKey"],
            function (items) {
              if (!items.bookmarkKeyChar) {
                messageDiv.innerHTML =
                  '<p class="fail">Please enter a Keyboard shortcut</p>';
              } else {
                messageDiv.innerHTML =
                  '<p class="success">Keyboard shortcut now set to <strong>' +
                  items.bookmarkSpecialKey +
                  " " +
                  items.bookmarkKeyChar +
                  "</strong><br /><small>Open tabs require a refresh</small></p>";
              }
            }
          );
        }
      );

      return false;
    });

  document
    .getElementById("bookmarkKeyChar")
    .addEventListener("keyup", function () {
      const input = this;
      const len = input.value.length;

      if (len > 1) {
        input.value = input.value.substr(len - 1, 1);
      }

      input.value = input.value.toUpperCase();
    });
});
