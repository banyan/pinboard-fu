function startPopup(description) {
	chrome.extension.getBackgroundPage().getSelection(addPinboardFromPopup);
};

function addPinboardFromPopup(description) {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.extension.sendRequest({
			type:        'addPinboard',
			url:         tab.url,
			title:       tab.title,
			description: description
		});
	});
};

window.addEventListener('load', startPopup);
