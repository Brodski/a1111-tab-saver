console.log('Background script loaded');


browser.runtime.onMessage.addListener(async (msg, sender) => {
    
    if (msg.type === "getAllUrls") {
        console.log("getAllUrls zzzz")
        let windows_and_tabs = await getAllUrls()
        return {windows_and_tabs, "tabId_current": sender.tab?.id};
    }
    if (msg.type === 'checkEnabledTab' && sender.tab) {
        const storageKey = `enabled_${sender.tab.id}`;
        const result = await browser.storage.local.get(storageKey);
        const isEnabled = result[storageKey] !== false;        
        return { EXTENSION_ENABLED: isEnabled };
    }
});


async function getAllUrls() {
  const windows = await browser.windows.getAll({ populate: true });

  const windows_and_tabs = windows.map(win => ({
    windowId: win.id,
    tabs: win.tabs.map(tab => ({
      id: tab.id,
      url: tab.url,
      title: tab.title
    }))
  }));

  console.log(windows_and_tabs);
  return windows_and_tabs;
}


browser.tabs.onCreated.addListener(tab => {
    console.log("onCreated", tab.id, tab.url);
});

browser.tabs.onRemoved.addListener((tabId) => {
    browser.storage.local.remove(`enabled_${tabId}`);
    console.log("onRemoved", tabId);
});




// // Clean up storage when tabs are closed to prevent memory bloat
// browser.tabs.onRemoved.addListener((tabId) => {
//     browser.storage.local.remove(`enabled_${tabId}`);
// });














// // Listen for messages from popup or content scripts
// browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log('Message received in background:', message);
  
//   if (message.action === 'buttonClicked') {
//     console.log('Button was clicked in popup');
//     sendResponse({status: 'success', message: 'Action completed'});
//   }
  
//   return true;
// });

// // Listen for tab updates
// browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete') {
//     console.log('Tab loaded:', tab.url);
//   }
// });

// // Listen for browser action (extension icon) clicks
// browser.browserAction.onClicked.addListener((tab) => {
//   console.log('Extension icon clicked on tab:', tab.id);
// });