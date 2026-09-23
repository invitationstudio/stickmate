// ========================================= */
// STICKMATE - SCRIPT.JS v3 (FINAL + AUTO UPDATE)
// ========================================= */

const a4Page = document.getElementById('a4Page');
const entryListDiv = document.getElementById('entryList');
const boxButtonsContainer = document.getElementById('boxButtonsContainer');
let entries = [];

const COLS = 3;
const ROWS = 7;
const BOX_W = 6;
const BOX_H = 3.5;
const TOTAL_BOXES = COLS * ROWS;

// ================== LOCAL STORAGE ==================
const fieldKeys = ['toName', 'toAddress', 'toMobile', 'fromName', 'fromAddress', 'fromMobile'];
let currentContactType = '';

function getSavedData(fieldId) {
    const data = localStorage.getItem('saved_' + fieldId);
    return data ? JSON.parse(data) : [];
}

function saveData(fieldId, value) {
    if (!value || value.trim() === '') return;
    value = value.trim();
    let saved = getSavedData(fieldId);
    if (!saved.includes(value)) {
        saved.push(value);
        if (saved.length > 50) saved.shift();
        localStorage.setItem('saved_' + fieldId, JSON.stringify(saved));
    }
}

function saveAllFields() {
    fieldKeys.forEach(key => {
        const value = document.getElementById(key).value;
        saveData(key, value);
    });
}

// ================== CONTACT BOOK ==================
function getContacts(type) {
    const data = localStorage.getItem('contacts_' + type);
    return data ? JSON.parse(data) : [];
}

function saveContact(type, contact) {
    if (!contact.name || contact.name.trim() === '') return;
    let contacts = getContacts(type);
    const exists = contacts.some(c => 
        c.name.toLowerCase() === contact.name.toLowerCase() && 
        c.mobile === contact.mobile
    );
    if (!exists) {
        contacts.push({
            name: contact.name.trim(),
            address: contact.address.trim(),
            mobile: contact.mobile.trim()
        });
        if (contacts.length > 100) contacts.shift();
        localStorage.setItem('contacts_' + type, JSON.stringify(contacts));
    }
}

function deleteContact(type, index) {
    const contacts = getContacts(type);
    const contactName = contacts[index].name;
    
    if (!confirm(`Tumhala "${contactName}" cha contact delete karaycha ahe ka?`)) {
        return;
    }
    
    contacts.splice(index, 1);
    localStorage.setItem('contacts_' + type, JSON.stringify(contacts));
    
    const searchQuery = document.getElementById('contactsSearch').value;
    if (searchQuery.trim() === '') {
        renderContactsList(getContacts(type));
    } else {
        filterContactsList();
    }
}

function showContacts(type) {
    currentContactType = type;
    const modal = document.getElementById('contactsModal');
    const title = document.getElementById('contactsTitle');
    const searchInput = document.getElementById('contactsSearch');
    
    title.innerText = type === 'to' ? '👥 TO Contacts (Receiver)' : '👥 FROM Contacts (Sender)';
    searchInput.value = '';
    renderContactsList(getContacts(type));
    modal.style.display = 'block';
    searchInput.focus();
}

function renderContactsList(contacts) {
    const list = document.getElementById('contactsList');
    list.innerHTML = '';
    
    if (contacts.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#999; padding:15px;">काही contacts save केलेले नाहीत. खाली "Save Current Form as Contact" बटण दाबा.</p>';
        return;
    }
    
    const reversedWithIndex = contacts.map((c, i) => ({ contact: c, originalIndex: i })).reverse();
    
    reversedWithIndex.forEach(({ contact, originalIndex }) => {
        const div = document.createElement('div');
        div.className = 'modal-list-item';
        
        const info = document.createElement('div');
        info.className = 'contact-info';
        info.innerHTML = `
            <span class="contact-name">${contact.name}</span>
            <span class="contact-detail">📍 ${contact.address || 'N/A'}</span>
            <span class="contact-detail">📱 ${contact.mobile || 'N/A'}</span>
        `;
        info.onclick = () => selectContact(contact);
        
        const delBtn = document.createElement('button');
        delBtn.className = 'contact-delete-btn';
        delBtn.innerHTML = '🗑️';
        delBtn.title = 'Delete this contact';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteContact(currentContactType, originalIndex);
        };
        
        div.appendChild(info);
        div.appendChild(delBtn);
        list.appendChild(div);
    });
}

function filterContactsList() {
    const query = document.getElementById('contactsSearch').value.toLowerCase().trim();
    const contacts = getContacts(currentContactType);
    if (query === '') {
        renderContactsList(contacts);
    } else {
        const filtered = contacts.filter(c => 
            c.name.toLowerCase().includes(query) ||
            c.address.toLowerCase().includes(query) ||
            c.mobile.toLowerCase().includes(query)
        );
        renderContactsList(filtered);
    }
}

function selectContact(contact) {
    const prefix = currentContactType;
    document.getElementById(prefix + 'Name').value = contact.name;
    document.getElementById(prefix + 'Address').value = contact.address;
    document.getElementById(prefix + 'Mobile').value = contact.mobile;
    closeContactsModal();
}

function saveCurrentContact() {
    const prefix = currentContactType;
    const name = document.getElementById(prefix + 'Name').value.trim();
    const address = document.getElementById(prefix + 'Address').value.trim();
    const mobile = document.getElementById(prefix + 'Mobile').value.trim();
    
    if (!name) {
        alert("कृपया आधी Name भरा, मग save करा!");
        return;
    }
    saveContact(prefix, { name, address, mobile });
    renderContactsList(getContacts(prefix));
    alert(`Contact "${name}" save zala!`);
}

function closeContactsModal() {
    document.getElementById('contactsModal').style.display = 'none';
    currentContactType = '';
}

window.onclick = function(event) {
    const contactsModal = document.getElementById('contactsModal');
    if (event.target === contactsModal) closeContactsModal();
}

// ================== BOX BUTTONS ==================
function generateBoxButtons() {
    boxButtonsContainer.innerHTML = '';
    const positions = [
        "Top-Left", "Top-Center", "Top-Right",
        "R2-Left", "R2-Center", "R2-Right",
        "R3-Left", "R3-Center", "R3-Right",
        "R4-Left", "R4-Center", "R4-Right",
        "R5-Left", "R5-Center", "R5-Right",
        "R6-Left", "R6-Center", "R6-Right",
        "R7-Left", "R7-Center", "R7-Right"
    ];
    for (let i = 1; i <= TOTAL_BOXES; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'box-btn';
        btn.innerHTML = `${i}<br><small>${positions[i-1]}</small>`;
        btn.onclick = () => printSingleBox(i);
        boxButtonsContainer.appendChild(btn);
    }
}

// ================== ENTRY LOGIC ==================
function addEntry() {
    if (entries.length >= TOTAL_BOXES) {
        alert(`Maximum ${TOTAL_BOXES} entries allowed ahet.`);
        return;
    }
    const data = getFormData();
    saveAllFields();
    entries.push(data);
    renderEntryList();
    clearForm();
}

function getFormData() {
    return {
        toName: document.getElementById('toName').value || "N/A",
        toAddress: document.getElementById('toAddress').value || "N/A",
        toMobile: document.getElementById('toMobile').value || "N/A",
        fromName: document.getElementById('fromName').value || "N/A",
        fromAddress: document.getElementById('fromAddress').value || "N/A",
        fromMobile: document.getElementById('fromMobile').value || "N/A",
        insurance: document.getElementById('insuranceAmount').value || "0"
    };
}

function renderEntryList() {
    entryListDiv.innerHTML = '';
    entries.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'entry-item';
        div.innerHTML = `
            <span><b>Box ${index + 1}:</b> ${entry.toName} (${entry.toMobile})</span>
            <div class="entry-actions">
                <button class="entry-preview-btn" onclick="previewEntry(${index})">👁️ Preview</button>
                <button class="entry-remove-btn" onclick="removeEntry(${index})">Remove</button>
            </div>
        `;
        entryListDiv.appendChild(div);
    });
}

function removeEntry(index) {
    entries.splice(index, 1);
    renderEntryList();
}

function clearForm() {
    document.getElementById('toName').value = '';
    document.getElementById('toAddress').value = '';
    document.getElementById('toMobile').value = '';
    document.getElementById('fromName').value = '';
    document.getElementById('fromAddress').value = '';
    document.getElementById('fromMobile').value = '';
    document.getElementById('insuranceAmount').value = '500';
    document.getElementById('toName').focus();
}

// ================== POSITION ==================
function getPosition(boxNumber) {
    const index = boxNumber - 1;
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    return { left: col * BOX_W, top: row * BOX_H };
}

// ================== CREATE STICKER BOX ==================
function createStickerBox(boxNumber, data) {
    const pos = getPosition(boxNumber);
    const box = document.createElement('div');
    box.className = 'sticker-box';
    box.style.left = pos.left + 'cm';
    box.style.top = pos.top + 'cm';

    const shortAddress = data.fromAddress.length > 12 
        ? data.fromAddress.substring(0, 12) + '..' 
        : data.fromAddress;
    const fromAddressMobile = `${shortAddress} ${data.fromMobile}`;

    box.innerHTML = `
        <div class="insurance-box">
            <span>INSURANCE</span>
            <span>₹${data.insurance}</span>
        </div>
        <div class="to-section">
            <div class="label">TO,</div>
            <span class="value">${data.toName}</span>
            <span class="value">${data.toAddress}</span>
            <span class="value">${data.toMobile}</span>
        </div>
        <div class="from-section">
            <div class="label">FROM,</div>
            <span class="value">${data.fromName}</span>
            <span class="value">${fromAddressMobile}</span>
        </div>
    `;
    return box;
}

function printSingleBox(boxNumber) {
    const data = getFormData();
    if (data.toName === "N/A" && data.toAddress === "N/A" && data.toMobile === "N/A") {
        alert("कृपया आधी फॉर्ममध्ये माहिती भरा!");
        return;
    }
    saveAllFields();
    a4Page.innerHTML = '';
    const box = createStickerBox(boxNumber, data);
    a4Page.appendChild(box);
    window.print();
}

function printAll() {
    if (entries.length === 0) {
        alert("कृपया आधी Entry Add करा!");
        return;
    }
    saveAllFields();
    a4Page.innerHTML = '';
    entries.forEach((data, index) => {
        const box = createStickerBox(index + 1, data);
        a4Page.appendChild(box);
    });
    window.print();
}

// ========================================= */
// PREVIEW FUNCTIONALITY
// ========================================= */
let previewData = null;
let previewBoxNumber = 1;

function previewCurrentEntry() {
    const data = getFormData();
    
    if (data.toName === "N/A" && data.toAddress === "N/A" && data.toMobile === "N/A") {
        alert("Krupaya aadhi form madhe details bhara!");
        return;
    }
    
    previewData = data;
    previewBoxNumber = 1;
    
    renderPreviewBox(data);
    document.getElementById('previewModal').style.display = 'block';
}

function previewEntry(index) {
    if (index < 0 || index >= entries.length) {
        alert("Entry sapadli nahi!");
        return;
    }
    
    const data = entries[index];
    previewData = data;
    previewBoxNumber = index + 1;
    
    renderPreviewBox(data);
    document.getElementById('previewModal').style.display = 'block';
}

function renderPreviewBox(data) {
    const previewContainer = document.getElementById('previewBoxContainer');
    previewContainer.innerHTML = '';
    
    const tempBox = document.createElement('div');
    tempBox.className = 'sticker-box';
    
    const shortAddress = data.fromAddress.length > 12 
        ? data.fromAddress.substring(0, 12) + '..' 
        : data.fromAddress;
    const fromAddressMobile = `${shortAddress} ${data.fromMobile}`;
    
    tempBox.innerHTML = `
        <div class="insurance-box">
            <span>INSURANCE</span>
            <span>₹${data.insurance}</span>
        </div>
        <div class="to-section">
            <div class="label">TO,</div>
            <span class="value">${data.toName}</span>
            <span class="value">${data.toAddress}</span>
            <span class="value">${data.toMobile}</span>
        </div>
        <div class="from-section">
            <div class="label">FROM,</div>
            <span class="value">${data.fromName}</span>
            <span class="value">${fromAddressMobile}</span>
        </div>
    `;
    
    previewContainer.appendChild(tempBox);
}

function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
    previewData = null;
}

function printPreview() {
    if (!previewData) {
        alert("Kाही data nahi ahe!");
        return;
    }
    
    document.getElementById('previewModal').style.display = 'none';
    saveAllFields();
    
    a4Page.innerHTML = '';
    const box = createStickerBox(previewBoxNumber, previewData);
    a4Page.appendChild(box);
    
    setTimeout(() => {
        window.print();
    }, 200);
}

window.addEventListener('click', (e) => {
    const previewModal = document.getElementById('previewModal');
    if (e.target === previewModal) {
        closePreviewModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePreviewModal();
    }
});

// ========================================= */
// PWA INSTALL LOGIC
// ========================================= */
let deferredPrompt;

function isAppInstalled() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    if (window.navigator.standalone === true) {
        return true;
    }
    return false;
}

function showInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn && !isAppInstalled()) {
        installBtn.style.display = 'block';
    }
}

function hideInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('✅ beforeinstallprompt fired');
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

function showInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let message = '';
    
    if (isIOS) {
        message = `📱 iPhone/iPad var Install Kase Karaycha:\n\n` +
                  `1. Safari ughada (Chrome nahi)\n` +
                  `2. Khali 'Share' button (□↑) dabla\n` +
                  `3. 'Add to Home Screen' select kara\n` +
                  `4. 'Add' dabla`;
    } else if (isAndroid) {
        message = `📱 Android var Install Kase Karaycha:\n\n` +
                  `1. Chrome ughada\n` +
                  `2. Ujव्या corner la 3 dots (⋮) dabla\n` +
                  `3. 'Install app' kinva 'Add to Home screen' select kara\n` +
                  `4. 'Install' dabla`;
    } else {
        message = `💻 Desktop var Install Kase Karaycha:\n\n` +
                  `1. Address bar madhe Install icon (⊕) disel\n` +
                  `2. Tyavar click kara\n` +
                  `3. 'Install' dabla`;
    }
    
    alert(message);
}

document.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response: ${outcome}`);
                deferredPrompt = null;
                hideInstallButton();
            } else {
                showInstallInstructions();
            }
        });
    }
    
    if (isAppInstalled()) {
        hideInstallButton();
    }
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isAppInstalled()) {
        showInstallButton();
    }
});

window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    hideInstallButton();
    deferredPrompt = null;
});

// ========================================= */
// FORCE UPDATE SYSTEM v3 - AUTO UPDATE CHECK
// ========================================= */
const APP_VERSION = 'v3'; // Update karta tar v4, v5 kara

// ========================================= */
// UPDATE POPUP DAKHAVNYACHA FUNCTION
// ========================================= */
function showUpdatePopup() {
    // Jar popup already asel tar parat dाखवू naka
    if (document.getElementById('updatePopup')) {
        return;
    }
    
    // Popup HTML tayar kara
    const popup = document.createElement('div');
    popup.id = 'updatePopup';
    popup.className = 'update-popup';
    popup.innerHTML = `
        <div class="update-popup-content">
            <div class="update-icon">🔄</div>
            <h3>Navin Update Available!</h3>
            <p>StickMate cha navin version tayar ahe. Ata update karaycha ka?</p>
            <div class="update-buttons">
                <button onclick="doUpdate()" class="update-btn-now">✅ Ata Update Kara</button>
                <button onclick="closeUpdatePopup()" class="update-btn-later">⏰ Nantar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Animation sathi
    setTimeout(() => {
        popup.classList.add('show');
    }, 100);
}

function closeUpdatePopup() {
    const popup = document.getElementById('updatePopup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
}

function doUpdate() {
    // Sagle caches clear kara
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('🗑️ Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            // Service Worker unregister kara
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    return Promise.all(registrations.map(r => r.unregister()));
                });
            }
        }).then(() => {
            // Version update kara
            localStorage.setItem('app_version', APP_VERSION);
            // Page reload kara (cache bypass sathi)
            window.location.reload(true);
        });
    } else {
        window.location.reload(true);
    }
}

// ========================================= */
// VERSION CHECK (App ughadतana)
// ========================================= */
function checkVersion() {
    const savedVersion = localStorage.getItem('app_version');
    console.log('📱 Saved Version:', savedVersion, '| Current Version:', APP_VERSION);
    
    // Jar saved version nasel (pratham veli) tar current version save kara
    if (savedVersion === null) {
        localStorage.setItem('app_version', APP_VERSION);
        console.log('✅ Pratham veli - Version saved:', APP_VERSION);
        return false;
    }
    
    // Jar version vegla asel tar update popup dाखवा
    if (savedVersion !== APP_VERSION) {
        console.log('🔄 Version mismatch! Update available!');
        showUpdatePopup();
        return true;
    }
    
    console.log('✅ Version match - kाही update nahi');
    return false;
}

// ========================================= */
// SERVICE WORKER + UPDATE CHECK
// ========================================= */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('✅ ServiceWorker registered:', registration.scope);
                
                // Pratyek 30 seconds la update check kara
                setInterval(() => {
                    registration.update();
                }, 30000);
                
                // Jar navin service worker sapadla tar
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 New Service Worker found!');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('✅ New version available!');
                            showUpdatePopup();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('❌ ServiceWorker registration failed:', error);
            });
    });
}

// ========================================= */
// AUTO UPDATE CHECK (App ughadतana)
// ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    // Version check kara
    checkVersion();
    
    // Har 60 seconds la version check kara
    setInterval(() => {
        checkVersion();
    }, 60000);
});

// ========================================= */
// INITIALIZE
// ========================================= */
window.onload = () => {
    renderEntryList();
    generateBoxButtons();
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isAppInstalled()) {
        setTimeout(showInstallButton, 1000);
    }
};