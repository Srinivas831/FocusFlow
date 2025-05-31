window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const message = event.data;

  if (message?.type === 'START_SESSION') {
    chrome.runtime.sendMessage({
      type: 'START_SESSION',
      payload: message.payload,
    });
  }

  if (message?.type === 'UPDATE_BLOCKLIST') {
    chrome.runtime.sendMessage({
      type: 'UPDATE_BLOCKLIST',
      payload: message.payload,
    });
  }

  if (message?.type === 'END_SESSION') {
    chrome.runtime.sendMessage({
      type: 'END_SESSION',
      payload: message.payload,
    });
  }
});