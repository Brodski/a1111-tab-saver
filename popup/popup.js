document.addEventListener("DOMContentLoaded", async (e) => {
    console.log('popup.js loading.....')
    initToggleTab()
    initToggleALL()
})

async function initToggleTab() {
    
    async function getCurrentTab() {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        return tabs[0];
    }

    async function loadToggleState() {
        const toggle = document.getElementById('toggleSwitch')
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];
        const storageKey = `enabled_${currentTab.id}`;
        
        const result = await browser.storage.local.get(storageKey);
        const isEnabled = result[storageKey] !== false; // Default to enabled
        
        console.log(`Tab ${currentTab.id} enabled:`, isEnabled);
        toggle.checked = isEnabled;
    }

    // GET
    loadToggleState();
    let toggle = document.getElementById('toggleSwitch')
    const tab = await getCurrentTab();
    const result = await browser.storage.local.get(`enabled_${tab.id}`);
    const isEnabled = result[`enabled_${tab.id}`] !== false;
    toggle.checked = isEnabled;

    // SET
    toggle.addEventListener('change', async (e) => {
        let isEnabled = e.target.checked;
        const tab = await getCurrentTab();
        await browser.storage.local.set({ [`enabled_${tab.id}`]: isEnabled });
        
        browser.tabs.sendMessage(tab.id, {
            type: 'toggleExtension',
            enabled: isEnabled
        }).catch(err => {
            console.log('Could not send message to content script:', err);
        });

        var refreshNotice = document.getElementById("refreshNotice");
        refreshNotice.style.display = "block";
    });


}
async function initToggleALL() {
    ///////////////////////////
    //   SET UP TOGGLE ALL   //
    ///////////////////////////
    const toggleall = document.getElementById("toggle");
    // Load current state
    browser.storage.local.get("EXTENSION_ENABLED").then(function(result) {
        console.log("EXTENSION_ENABLED REZZZULT")
        console.log(result)
        console.log("result.EXTENSION_ENABLED", result.EXTENSION_ENABLED)
        if (result.EXTENSION_ENABLED === false) {
            toggleall.checked = false;
        } else {
            toggleall.checked = true;
        }
    });
    // Save on change
    toggleall.addEventListener("change", () => {
        browser.storage.local.set({ "EXTENSION_ENABLED": toggleall.checked });

        // Notify all tabs
        browser.tabs.query({}).then(tabs => {
            for (const tab of tabs) {
                browser.tabs.sendMessage(tab.id, {
                    type: "TOGGLE",
                    enabled: toggle.checked
                }).catch(() => {});
            }
        })

        //     var refreshNotice = document.getElementById("refreshNotice");
        //     refreshNotice.style.display = "block";
        // });

    });
}