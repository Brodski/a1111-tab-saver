# Firefox Extension Boilerplate

A basic Firefox browser extension starter template.

## Project Structure

```
.
├── manifest.json          # Extension configuration
├── background.js          # Background script (runs persistently)
├── content.js            # Content script (runs on web pages)
├── popup/
│   ├── popup.html        # Popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
└── icons/
    ├── icon-48.png       # Extension icon (48x48)
    └── icon-96.png       # Extension icon (96x96)
```

## How to Load the Extension in Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to your extension folder and select `manifest.json`

The extension will now be loaded temporarily and will remain until you restart Firefox.

## How to Test

1. Click the extension icon in the toolbar to open the popup
2. Click the button in the popup to trigger actions
3. Open the Browser Console (Ctrl+Shift+J / Cmd+Shift+J) to see console logs
4. Visit any website to see the content script in action

## Key Files Explained

### manifest.json
- Defines extension metadata, permissions, and components
- Specifies which scripts run where

### background.js
- Runs in the background
- Handles events, manages state
- Can communicate with content scripts and popups

### content.js
- Runs in the context of web pages
- Can access and modify the DOM
- Isolated from the page's JavaScript

### popup/
- The UI that appears when clicking the extension icon
- Can communicate with background and content scripts

## Common Permissions

Add these to `manifest.json` as needed:

- `"activeTab"` - Access the currently active tab
- `"tabs"` - Access tab information
- `"storage"` - Use browser.storage API
- `"webRequest"` - Intercept web requests
- `"<all_urls>"` - Access all websites
- `"cookies"` - Access cookies

## Development Tips

- Use `console.log()` to debug
- Check the Browser Console for background script logs
- Check the page's Developer Console for content script logs
- Use `browser.runtime.reload()` or reload from about:debugging after changes

## Publishing

To publish your extension:

1. Create icons (48x48 and 96x96 minimum)
2. Update manifest.json with your details
3. Zip the extension folder
4. Submit to Mozilla Add-ons at https://addons.mozilla.org/developers/

## Resources

- [MDN Web Extensions Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Browser Extension APIs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)