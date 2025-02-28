document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('load', () => {
    chrome.storage.local.get(
      ['bookmarkKeyChar', 'bookmarkSpecialKey'],
      (items) => {
        const bookmarkKeyCharInput = document.getElementById('bookmarkKeyChar');
        const bookmarkSpecialKeySelect =
          document.getElementById('bookmarkSpecialKey');

        if (items.bookmarkKeyChar) {
          bookmarkKeyCharInput.value = items.bookmarkKeyChar;

          if (
            items.bookmarkSpecialKey === null ||
            items.bookmarkSpecialKey === undefined
          ) {
            bookmarkSpecialKeySelect.value = 'alt'; // Default to alt
          } else {
            bookmarkSpecialKeySelect.value = items.bookmarkSpecialKey;
          }
        } else {
          // Set defaults if no saved options
          bookmarkKeyCharInput.value = 'D';
          bookmarkSpecialKeySelect.value = 'alt';
        }
      }
    );
  });

  document.getElementById('save_options').addEventListener('submit', (e) => {
    e.preventDefault();

    const bookmarkKeyChar = document.getElementById('bookmarkKeyChar').value;
    const bookmarkSpecialKey =
      document.getElementById('bookmarkSpecialKey').value;
    const messageDiv = document.getElementById('message');

    chrome.storage.local.set(
      {
        bookmarkKeyChar: bookmarkKeyChar,
        bookmarkSpecialKey: bookmarkSpecialKey,
      },
      () => {
        // Check if save was successful
        chrome.storage.local.get(
          ['bookmarkKeyChar', 'bookmarkSpecialKey'],
          (items) => {
            if (!items.bookmarkKeyChar) {
              messageDiv.innerHTML =
                '<p class="fail">Please enter a Keyboard shortcut</p>';
            } else {
              messageDiv.innerHTML = `<p class="success">Keyboard shortcut now set to <strong>${items.bookmarkSpecialKey} ${items.bookmarkKeyChar}</strong><br /><small>Open tabs require a refresh</small></p>`;
            }
          }
        );
      }
    );

    return false;
  });

  document
    .getElementById('bookmarkKeyChar')
    .addEventListener('keyup', function () {
      const len = this.value.length;

      if (len > 1) {
        this.value = this.value.substr(len - 1, 1);
      }

      this.value = this.value.toUpperCase();
    });
});
