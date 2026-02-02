
let EXTENSION_ENABLED = true;


//////////////////////
//                  //
//       INIT       //
//                  //
//////////////////////
if (document.readyState == 'complete') {
    shittyPageWaitLoad(0)
}
else {
    window.addEventListener('load', () => {
        shittyPageWaitLoad(0)
    })
}


function shittyPageWaitLoad(prev_inputz_length) {
    if (EXTENSION_ENABLED == false) {
        console.log("-- EXTENSION IS OFF --")
        return
    }
    let current_inputz_length = (document.querySelectorAll("input")).length
    if (current_inputz_length <= prev_inputz_length) {
        setTimeout(() => {
            shittyPageWaitLoad(current_inputz_length)
        }, 2000);
    }
    else {
        /////////////
        // KICK IT //
        /////////////
        console.log("TIME TO KICKIT")
        kickIt()
    }
}




/////////////////////////
//                     //
//   GET INIT STATE    //
//                     //
/////////////////////////

// GLOBAL is on/off?
browser.storage.local.get("EXTENSION_ENABLED").then(function(result) {
    if (result.EXTENSION_ENABLED === false) {
        EXTENSION_ENABLED = false;
    } else {
        EXTENSION_ENABLED = true;
        start();
    }
});
// Tab is on/off?
browser.runtime.sendMessage({ type: 'checkEnabledTab' }).then(response => {
    console.log("response")
    console.log(response)
    if (response.EXTENSION_ENABLED == false) {
        EXTENSION_ENABLED = false;
    }
    else {
        EXTENSION_ENABLED = true;
        start()
    }
});

// Listen for toggle changes
browser.runtime.onMessage.addListener(msg => {
    if (msg.type === "TOGGLE" || msg.type == "toggleExtension") {
        console.log("msg")
        console.log(msg)
        EXTENSION_ENABLED = msg.EXTENSION_ENABLED;
            if (EXTENSION_ENABLED) {
                start();
            } else {
                stop();
        }
    }
});

function start() {
  console.log("Extension ON");
}
function stop() {
  console.log("Extension disabled");
}

function kickIt() {
    //////////////////////////
    //                      //
    //   LOAD PREV STATE    //
    //                      //
    //////////////////////////
    let url = new URL(window.location.href);
    let session = url.searchParams.get("session")
    if (!session) {
        const id = makeId();
        url.searchParams.set("session", id);
        history.replaceState(null, "", url.toString());
    }
    else {
        console.log('session_params=', session)
        setTimeout(() => {
            restoreAll(session);
        }, 3000);
        
        
        browser.runtime.sendMessage({
            type: "getAllUrls"
        }).then(response => {
            let windows_and_tabs = response.windows_and_tabs
            let tabId_current = response.tabId_current // tabId_currents are unique https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab#id
            console.log("Response from background:", windows_and_tabs);
            console.log("tabId_current:", tabId_current);

            for (let window of windows_and_tabs) {
                for (let tab of window.tabs) {
                    if (tab.id == tabId_current) {
                        // WE ARE ON SAME TAB NO NEED TO MODIFY session
                        continue
                    }

                    let tab_url = new URL(tab.url);
                    let tab_session = tab_url.searchParams.get("session")
                    if (tab_url.host == "127.0.0.1:7860" && tab_session == session) { 
                            console.log("CREATED NEW SESSION")
                            console.log("CREATED NEW SESSION")
                            console.log("CREATED NEW SESSION")
                            console.log("CREATED NEW SESSION")
                            console.log("CREATED NEW SESSION")
                            // let session_dedup = incrementIdPro()
                            let session_dedup = makeId()
                            url.searchParams.set("session", session_dedup);
                            history.replaceState(null, "", url.toString());
                    }
                }
            }
        });

    }
    ////////////////////////////////
    //                            //
    //    ADD EVENTS TO INPUTS    //
    //                            //
    ////////////////////////////////
    let EVERY_INPUT = getEveryInput()
    for (let inp of EVERY_INPUT) {
        let timeoutId;
        inp.addEventListener('input', (event) => {
            console.log('input changed stuff.........')
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {  
                console.log('Value changed to:', event.target.value);
                saveAll()
            }, 2000)
        });
    }

    /////////////////////
    //                 //
    //     BUTTONS     //
    //                 //
    /////////////////////
    injectCss()
    injectButtons()
}



function saveAll() {
    if (EXTENSION_ENABLED == false) {
        console.log("NOT SAVING B/C OFF")
        return
    }
    console.log("------- SAVED -------")
    let EVERY_INPUT = getEveryInput()
    let savedData = {};

    for (let [i, inp] of EVERY_INPUT.entries()) {
        let key = `input_${i}`;

        // Save the value based on input type
        if (inp.type === 'file') {
            console.log("IS FILE TYPE!!!")
            console.log(inp)
            savedData[key] = "file type"
            continue
        }
        if (inp.type === 'checkbox' || inp.type === 'radio') {
            savedData[key] = inp.checked;
        } else {
            // console.log(inp)
            // console.log(key, inp.value)
            savedData[key] = inp.value;
        }

    }
    
    let url = new URL(window.location.href);
    let session = url.searchParams.get("session")
    localStorage.setItem(session, JSON.stringify(savedData));
    console.log('Saved:', savedData);
}

function restoreAll(session) {
    let saved = localStorage.getItem(session);
    if (!saved) {
        console.log("ℹ️ no session found")
    }
    if (saved) {
        let savedData = JSON.parse(saved);
        let EVERY_INPUT = getEveryInput();
        for (let [i, inp] of EVERY_INPUT.entries()) {
            let key = `input_${i}`;
            if (key in savedData) {                
                if (inp.type === 'file') {
                    // console.log("SKIP - IS FILE TYPE!!!")
                    // console.log(inp)
                    continue
                }
                if (inp.type === 'checkbox' || inp.type === 'radio') {
                    inp.checked = savedData[key];
                } else {
                    // console.log(inp)
                    // console.log('adding stuff....', savedData[key])
                   try {
                        inp.value = savedData[key];
                    } catch(e) {
                        console.error(`Could not restore value for input ${inp}:`, e);
                        console.log(inp)
                    }
                }
            }
        }
    }
}


function getEveryInput() {
    ////////////////////////////////////////
    //   ⚠️ DO NOT CHANGE THE ORDER  ⚠️  //
    ////////////////////////////////////////
    const query = (selector) => document.querySelectorAll(`${selector} input, ${selector} textarea, ${selector} select`);

    let inputz_bskiTitle     = document.querySelectorAll("#bskiTitle")
    let inputz_tab_txt2img   = query("#tab_txt2img");
    let inputz_tab_img2img   = query("#tab_img2img");
    let inputz_tab_extras    = query("#tab_extras");
    let inputz_quicksettings = query("#quicksettings");
    let inputz_tab_pnginfo   = query("#tab_pnginfo");
    let EVERY_INPUT = [ ...inputz_bskiTitle, ...inputz_tab_txt2img, ...inputz_tab_img2img, ...inputz_tab_extras, ...inputz_quicksettings, ...inputz_tab_pnginfo];
    return EVERY_INPUT
}


function makeId(len = 10) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    const bytes = crypto.getRandomValues(new Uint8Array(len));
    for (let i = 0; i < len; i++) {
        out += chars[bytes[i] % chars.length];
    }
    return out;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////
//                          //
//     ADD SOME BUTTONS     //
//                          //
//////////////////////////////
function injectCss() {
    const style = document.createElement("style");
    style.textContent = `
    button.bski_btn {
        flex: unset;
        min-width: unset;
    }
    .dropdown {
        position: relative;
        display: inline-block;
    }

    .dropdown-menu {
        display: none;
        position: absolute;
          background-color: black;
        border: 1px solid #ccc;
        padding: 4px;
        min-width: 200px;
        list-style: none;
        z-index: 1000;
        
        /* Scroll settings */
        max-height: 240px; /* roughly 10 items × 24px per item */
        overflow-y: auto;
    }
    .dropdown-menu::-webkit-scrollbar {
        width: 8px;
    }
        
    .dropdown-menu::-webkit-scrollbar-thumb {
        background-color: #aaa;
        border-radius: 4px;
    }
    .dropdown-menu::-webkit-scrollbar-track {
        background-color: #f0f0f0;
    }

    .dropdown-menu.open {
        display: block;
    }

    .dropdown-menu li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
        padding: 4px;
    }
    `;

    document.head.appendChild(style);
}

function injectButtons() {
    
    
    // #quicksettings = NOT MY CODE -> element on the a1111 UI webpage
    let quickSettings = document.getElementById("quicksettings");

    // if (quickSettings) {
    //     const buttons = [
    //         { text: "Save", onClick: ()  => ui_save_button() },
    //         { text: "restoreAll", onClick: () => restoreAll() },
    //         { text: "New", onClick: ()  => ui_new_button() }
    //     ];

    //     buttons.forEach(({ text, onClick }) => {
    //         const btn = document.createElement("button");
    //         btn.textContent = text;
    //         btn.type = "button";
    //         btn.addEventListener("click", onClick);
    //         // btn.classList.add("lg", "secondary", "gradio-button", "custom-button", "tool");
    //         btn.classList.add("lg", "secondary", "gradio-button", "custom-button", "bski_btn");
    //         quickSettings.appendChild(btn);
    //     });
    // }

    const dropdownXXL = `
        <div class="dropdown">
            <button class="dropdown-toggle">Items ▾</button>
            <ul class="dropdown-menu">
            </ul>
        </div>
    `

    quickSettings.insertAdjacentHTML("beforeend", dropdownXXL)
    const items = new Map([
        ["1", "Item One"],
        ["2", "Item Two"],
        ["3", "Item Three"],
        ["4", "Item four"],
        ["5", "Item five"],
        ["61", "Item six"],
        ["62", "Item six"],
        ["63", "Item six"],
        ["645", "Item six"],
        ["65", "Item six"],
        ["6asd", "Item six"],
        ["6v", "Item six"],
        ["6s", "Item six"],
        ["6et", "Item six"],
        ["6h", "Item six"],
    ]);
    const dropdown = quickSettings.querySelector(".dropdown-toggle");
    const menu = quickSettings.querySelector(".dropdown-menu");

    for (const [key, value] of items) {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="label">${value}</span>
            <button id="load">Rename</button>
            <button id="delete">Delete</button>
        `;
        const loadBtn = li.querySelector("#load");
        const deleteBtn = li.querySelector("#delete");

        loadBtn.onclick = () => load_inputs(value);   // pass value or key if needed
        deleteBtn.onclick = () => delete_inputs(value);


        menu.appendChild(li);
    }
    dropdown.addEventListener("click", () => {
        menu.classList.toggle("open");
    });
}


function load_inputs() {
    console.log("LOADDDDDDDDDDDD")
}
function delete_inputs() {
    console.log('deleted')
}

function ui_save_button() {
    console.log("Save clicked") 
}
function ui_new_button() {
    console.log("Help clicked")
}


function incrementIdPro() {
    /////////////////////////////////////////////////////////////////////////
    //   TOO COMPLICATED ... BUT SHOLD BE LIKE $session=wKuwXKljnX_copy4
    /////////////////////////////////////////////////////////////////////////
    // let re = /(.+)_copy(\d+)$/;
    // let match = re.exec(tab_session);
    // let dedupNum = match ? Number(match[2]) : null;
    // let sess_original = match ? match[1] : null;
    // console.log("REGEX NUM:", dedupNum)
    // console.log("REGEX SESSION:", sess_original)
    // dedupNum = dedupNum == null ? 1 : dedupNum + 1
    // console.log("REGEX NUM AFTER:", dedupNum)
    // let session_dedup = sess_original + `_copy${dedupNum}`
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////