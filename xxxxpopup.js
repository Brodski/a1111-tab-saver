document.addEventListener('DOMContentLoaded', function() {
  const actionButton = document.getElementById('actionButton');
  
  actionButton.addEventListener('click', function() {
    // Send a message to the background script
    browser.runtime.sendMessage({
      action: 'buttonClicked'
    }).then(response => {
      console.log('Response from background:', response);
    });
    
    // Or execute a content script in the active tab
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      browser.tabs.sendMessage(tabs[0].id, {
        action: 'doSomething'
      });
    });
  });
});