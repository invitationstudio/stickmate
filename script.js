// ========================================= */
// STICKMATE - SCRIPT.JS v3 (FINAL + AUTO UPDATE + ENTER NAVIGATION)
// ========================================= */

const a4Page = document.getElementById('a4Page');
const entryListDiv = document.getElementById('entryList');
const boxButtonsContainer = document.getElementById('boxButtonsContainer');
let entries = [];

// Default values
let COLS = 3;
let ROWS = 7;
let BOX_W = 6;
let BOX_H = 3.5;
let TOTAL_BOXES = COLS * ROWS;

// A4 Page dimensions (cm)
const PAGE_W = 21;
const PAGE_H = 29.7;
const MARGIN = 0.5; // Page margin in cm

// Function to calculate grid based on sticker size
function calculateGrid(boxW, boxH) {
    const availableW = PAGE_W - (MARGIN * 2);
    const availableH = PAGE_H - (MARGIN * 2);
    
    COLS = Math.floor(availableW / boxW);
    ROWS = Math.floor(availableH / boxH);
    TOTAL_BOXES = COLS * ROWS;
    BOX_W = boxW;
    BOX_H = boxH;
    
    console.log(`📐 Default Size: ${boxW}x${boxH}cm | Grid: ${COLS}x${ROWS} | Total: ${TOTAL_BOXES}`);
}

// Function to change sticker size
function changeStickerSize(sizeValue) {
    const [w, h] = sizeValue.split('x').map(Number);
    calculateGrid(w, h);
    
    updateStickerBoxCSS(w, h);
    generateBoxButtons();
    updateDropdownOptions();
    
    // Entries delete kadhun takle ahet - Mix size allowed ahe!
    // Fakt message dakhva
    
    alert(`✅ Size set: ${w}cm × ${h}cm\n📄 Ya size sathi page madhe ${TOTAL_BOXES} stickers adjust hotil (${COLS} columns × ${ROWS} rows)\n\n💡 Note: Existing entries delete honar nahit. Pratyek entry tya velchi size save karte.`);
}

// Update sticker box CSS dynamically
function updateStickerBoxCSS(w, h) {
    // Ha fakt default size set karto, actual size createStickerBox madhe inline style ne yeto
    let styleEl = document.getElementById('dynamicStickerStyle');
    if (styleEl) styleEl.remove();
    
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicStickerStyle';
    styleEl.innerHTML = `
        .sticker-box {
            width: ${w - 0.6}cm;
            height: ${h - 0.6}cm;
        }
    `;
    document.head.appendChild(styleEl);
}

// Update dropdown options dynamically
function updateDropdownOptions() {
    const dropdown = document.getElementById('quickPrintDropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">-- Select Box --</option>';
    
    const positions = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const rowName = r === 0 ? 'Top' : `R${r + 1}`;
            const colName = c === 0 ? 'Left' : (c === 1 ? 'Center' : 'Right');
            positions.push(`${rowName}-${colName}`);
        }
    }
    
    // Ata dropdown madhe 1 te TOTAL_BOXES paryant options dakhva
    // Pan fakt 1-3 buttons ahet, tar dropdown madhe 4 te TOTAL_BOXES dakhva
    for (let i = 4; i <= TOTAL_BOXES; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Box ${i} (${positions[i - 1]})`;
        dropdown.appendChild(opt);
    }
}
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
    
    if (!confirm(`तुम्हाला "${contactName}" हा contact डिलीट करायचा आहे का?`)) {
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

// ========================================= */
// SETTINGS - BACKUP & RESTORE
// ========================================= */

function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

// Backup Contacts - Download JSON file
function backupContacts() {
    const backupData = {
        version: 'v3',
        backupDate: new Date().toISOString(),
        contacts_to: getContacts('to'),
        contacts_from: getContacts('from'),
        saved_fields: {}
    };
    
    // Sagle saved fields pan backup kara
    fieldKeys.forEach(key => {
        backupData.saved_fields[key] = getSavedData(key);
    });
    
    // JSON file download kara
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `stickmate_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert("✅ Backup download zala!\n\nFile tumchya Downloads folder madhe save zali ahe.");
}

// Restore Contacts - Upload JSON file
function restoreContacts(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // Validate backup file
            if (!backupData.contacts_to && !backupData.contacts_from) {
                alert("❌ Chukicha file! Ha StickMate cha backup file nahi ahe.");
                return;
            }
            
            if (!confirm("⚠️ Restore kelyavar existing contacts replace hotil. Thik ahe ka?")) {
                event.target.value = '';
                return;
            }
            
            // Contacts restore kara
            if (backupData.contacts_to) {
                localStorage.setItem('contacts_to', JSON.stringify(backupData.contacts_to));
            }
            if (backupData.contacts_from) {
                localStorage.setItem('contacts_from', JSON.stringify(backupData.contacts_from));
            }
            
            // Saved fields pan restore kara
            if (backupData.saved_fields) {
                fieldKeys.forEach(key => {
                    if (backupData.saved_fields[key]) {
                        localStorage.setItem('saved_' + key, JSON.stringify(backupData.saved_fields[key]));
                    }
                });
            }
            
            const toCount = backupData.contacts_to ? backupData.contacts_to.length : 0;
            const fromCount = backupData.contacts_from ? backupData.contacts_from.length : 0;
            
            alert(`✅ Restore zala!\n\n📱 TO Contacts: ${toCount}\n📱 FROM Contacts: ${fromCount}`);
            
            // File input reset kara
            event.target.value = '';
            
            // Modal band kara
            closeSettingsModal();
            
        } catch (error) {
            console.error('Restore error:', error);
            alert("❌ File read karta aali nahi. Thik file select kara.");
            event.target.value = '';
        }
    };
    
    reader.readAsText(file);
}

// Clear All Contacts
function clearAllContacts() {
    if (!confirm("⚠️ Sagle saved contacts delete hotil. Ha parat parat yeu shakat nahi. Thik ahe ka?")) {
        return;
    }
    
    if (!confirm("🔴 LAST WARNING: Sagle contacts delete hoil. Confirm kara?")) {
        return;
    }
    
    localStorage.removeItem('contacts_to');
    localStorage.removeItem('contacts_from');
    
    // Saved fields pan clear kara
    fieldKeys.forEach(key => {
        localStorage.removeItem('saved_' + key);
    });
    
    alert("✅ Sagle contacts delete zale.");
    closeSettingsModal();
}

// Settings Modal bahar click kelyavar band kara
window.addEventListener('click', (event) => {
    const settingsModal = document.getElementById('settingsModal');
    if (event.target === settingsModal) {
        closeSettingsModal();
    }
});

// ================== BOX BUTTONS ==================
function generateBoxButtons() {
    boxButtonsContainer.innerHTML = '';
    
    const positions = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const rowName = r === 0 ? 'Top' : `R${r + 1}`;
            const colName = c === 0 ? 'Left' : (c === 1 ? 'Center' : 'Right');
            positions.push(`${rowName}-${colName}`);
        }
    }
    
    // Fakt 3 buttons dakhva (1, 2, 3)
    const maxButtons = Math.min(3, TOTAL_BOXES);
    for (let i = 1; i <= maxButtons; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'box-btn';
        btn.innerHTML = `${i}<br><small>${positions[i-1]}</small>`;
        btn.onclick = () => printSingleBox(i);
        boxButtonsContainer.appendChild(btn);
    }
}

// Dropdown madhun box select kelyavar print kara
function printSelectedBox(boxNumber) {
    if (!boxNumber) return;
    printSingleBox(parseInt(boxNumber));
    // Print zalyavar dropdown reset kara
    document.getElementById('quickPrintDropdown').value = '';
}

// ================== ENTRY LOGIC ==================
function addEntry() {
    // Ata maximum limit nahi ahe, karan mix size ahet
    const data = getFormData();
    
    // Tya velchi size entry madhe save kara
    data.sizeW = BOX_W;
    data.sizeH = BOX_H;
    data.sizeLabel = `${BOX_W}x${BOX_H}`;
    
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
        insurance: document.getElementById('insuranceAmount').value || "0",
        sizeW: BOX_W,
        sizeH: BOX_H,
        sizeLabel: `${BOX_W}x${BOX_H}`
    };
}

function renderEntryList() {
    entryListDiv.innerHTML = '';
    entries.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'entry-item';
        const sizeLabel = entry.sizeLabel || `${BOX_W}x${BOX_H}`;
        div.innerHTML = `
            <span><b>#${index + 1}:</b> ${entry.toName} (${entry.toMobile}) <small style="color:#888;">[${sizeLabel}cm]</small></span>
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
    document.getElementById('insuranceAmount').value = '';
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
function createStickerBox(boxNumber, data, customPos = null, customSize = null) {
    // Jar custom position dileli asel tar ti vapra, nahitar getPosition vapra
    const pos = customPos || getPosition(boxNumber);
    
    // Jar custom size dileli asel tar ti vapra, nahitar data madhli size vapra
    const w = customSize ? customSize.w : (data.sizeW || BOX_W);
    const h = customSize ? customSize.h : (data.sizeH || BOX_H);
    
    const box = document.createElement('div');
    box.className = 'sticker-box';
    box.style.left = pos.left + 'cm';
    box.style.top = pos.top + 'cm';
    box.style.width = (w - 0.6) + 'cm';  // Border aani padding sathi 0.6cm kami
    box.style.height = (h - 0.6) + 'cm';

    const shortAddress = data.fromAddress.length > 12 
        ? data.fromAddress.substring(0, 12) + '..' 
        : data.fromAddress;
    const fromAddressMobile = `${shortAddress} ${data.fromMobile}`;

    box.innerHTML = `
        <div class="insurance-box">
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
    
    // Data madhe current size save kara
    data.sizeW = BOX_W;
    data.sizeH = BOX_H;
    data.sizeLabel = `${BOX_W}x${BOX_H}`;
    
    a4Page.innerHTML = '';
    const pos = getPosition(boxNumber);
    const box = createStickerBox(boxNumber, data, pos, { w: BOX_W, h: BOX_H });
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
    
    // Mix size sathi dynamic positioning
    // Pratyek entry cha size vaprun page var yogy position madhe basva
    let currentX = MARGIN;
    let currentY = MARGIN;
    let rowHeight = 0;
    
    entries.forEach((data) => {
        const w = data.sizeW || BOX_W;
        const h = data.sizeH || BOX_H;
        
        // Jar current row madhe jaga nasel tar next row la ja
        if (currentX + w > PAGE_W - MARGIN) {
            currentX = MARGIN;
            currentY += rowHeight;
            rowHeight = 0;
        }
        
        // Jar page khali sampat asel tar nava page (kinva warning)
        if (currentY + h > PAGE_H - MARGIN) {
            // Ata fakt ekach page ahe, tar ithe thambva
            // (Future madhe multiple pages sathi)
            console.warn("Page full! Kahi stickers adjust zale nahit.");
            return;
        }
        
        const box = createStickerBox(0, data, { left: currentX, top: currentY }, { w, h });
        a4Page.appendChild(box);
        
        currentX += w;
        if (h > rowHeight) rowHeight = h;
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
        alert("कृपया आधी फॉर्ममध्ये माहिती भरा!");
        return;
    }
    
    previewData = data;
    previewBoxNumber = 1;
    
    renderPreviewBox(data);
    document.getElementById('previewModal').style.display = 'block';
}

// ========================================= */
// GENERATE ALL 21 STICKERS AUTO
// ========================================= */
function generateAllStickers() {
    const data = getFormData();
    
    // Check kara ki TO details bharle ahet ka
    if (data.toName === "N/A" && data.toAddress === "N/A" && data.toMobile === "N/A") {
        alert("कृपया आधी TO आणि FROM details भरा!");
        return;
    }
    
    // Current size nusar kiti stickers page var basu shaktat te calculate kara
    const availableW = PAGE_W - (MARGIN * 2);
    const availableH = PAGE_H - (MARGIN * 2);
    const cols = Math.floor(availableW / BOX_W);
    const rows = Math.floor(availableH / BOX_H);
    const totalStickers = cols * rows;
    
    // Entries clear kara aani sagle stickers auto-generate kara
    entries = [];
    for (let i = 0; i < totalStickers; i++) {
        const stickerData = { ...data }; // Copy data
        stickerData.sizeW = BOX_W;
        stickerData.sizeH = BOX_H;
        stickerData.sizeLabel = `${BOX_W}x${BOX_H}`;
        entries.push(stickerData);
    }
    
    renderEntryList();
    saveAllFields();
    
    alert(`✅ ${totalStickers} stickers auto-generate zale! (${cols} columns × ${rows} rows)\nAta print kara.`);
    
    // Direct print kara
    printAll();
}

function previewEntry(index) {
    if (index < 0 || index >= entries.length) {
        alert("Entry सापडली नाही!");
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
    
    // Size dynamic kara
    const w = data.sizeW || BOX_W;
    const h = data.sizeH || BOX_H;
    tempBox.style.width = (w - 0.6) + 'cm';
    tempBox.style.height = (h - 0.6) + 'cm';
    tempBox.style.position = 'relative';
    tempBox.style.left = '0';
    tempBox.style.top = '0';
    
    const shortAddress = data.fromAddress.length > 12 
        ? data.fromAddress.substring(0, 12) + '..' 
        : data.fromAddress;
    const fromAddressMobile = `${shortAddress} ${data.fromMobile}`;
    
    tempBox.innerHTML = `
        <div class="insurance-box">
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
        alert("काही data नाही आहे!");
        return;
    }
    
    document.getElementById('previewModal').style.display = 'none';
    saveAllFields();
    
    a4Page.innerHTML = '';
    
    // Preview data madhli size vapra
    const w = previewData.sizeW || BOX_W;
    const h = previewData.sizeH || BOX_H;
    
    const box = createStickerBox(previewBoxNumber, previewData, { left: MARGIN, top: MARGIN }, { w, h });
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
        closeSettingsModal();
    }
});

// ========================================= */
// ENTER KEY NAVIGATION (Next Field madhe shift)
// ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    // Sagle input fields cha order
    const inputOrder = [
        'toName',
        'toAddress',
        'toMobile',
        'fromName',
        'fromAddress',
        'fromMobile',
        'insuranceAmount'
    ];

    inputOrder.forEach((fieldId, index) => {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();

                const nextIndex = index + 1;
                if (nextIndex < inputOrder.length) {
                    const nextField = document.getElementById(inputOrder[nextIndex]);
                    if (nextField) {
                        nextField.focus();
                        nextField.select();
                    }
                } else {
                    // Shevatcha field (insurance) madhe Enter dabli tar Add to List
                    addEntry();
                }
            }
        });
    });
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

function showUpdatePopup() {
    if (document.getElementById('updatePopup')) {
        return;
    }
    
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
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('🗑️ Deleting cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    return Promise.all(registrations.map(r => r.unregister()));
                });
            }
        }).then(() => {
            localStorage.setItem('app_version', APP_VERSION);
            window.location.reload(true);
        });
    } else {
        window.location.reload(true);
    }
}

function checkVersion() {
    const savedVersion = localStorage.getItem('app_version');
    console.log('📱 Saved Version:', savedVersion, '| Current Version:', APP_VERSION);
    
    if (savedVersion === null) {
        localStorage.setItem('app_version', APP_VERSION);
        console.log('✅ Pratham veli - Version saved:', APP_VERSION);
        return false;
    }
    
    if (savedVersion !== APP_VERSION) {
        console.log('🔄 Version mismatch! Update available!');
        showUpdatePopup();
        return true;
    }
    
    console.log('✅ Version match - kाही update nahi');
    return false;
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('✅ ServiceWorker registered:', registration.scope);
                
                setInterval(() => {
                    registration.update();
                }, 30000);
                
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

document.addEventListener('DOMContentLoaded', () => {
    checkVersion();
    
    setInterval(() => {
        checkVersion();
    }, 60000);
});

// ========================================= */
// INITIALIZE
// ========================================= */
window.onload = () => {
    // Initial grid calculation
    calculateGrid(6, 3.5);
    updateStickerBoxCSS(6, 3.5);
    updateDropdownOptions();
    
    renderEntryList();
    generateBoxButtons();
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !isAppInstalled()) {
        setTimeout(showInstallButton, 1000);
    }
};
// ========================================= */
// KEYBOARD SHORTCUTS
// ========================================= */

document.addEventListener('keydown', (e) => {
    // ========================================= */
    // ALT + P = PREVIEW
    // ========================================= */
    if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        console.log('⌨️ Alt+P - Preview');
        previewCurrentEntry();
        return;
    }
    
    // ========================================= */
    // CTRL + P = PRINT (Default browser print)
    // ========================================= */
    if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        // Browser cha default print dialog ughadel
        // Aapan fakt printAll() call karto
        e.preventDefault();
        console.log('⌨️ Ctrl+P - Print');
        
        // Jar form madhe data asel tar print kara
        const data = getFormData();
        if (data.toName !== "N/A" || data.toAddress !== "N/A" || data.toMobile !== "N/A") {
            printSingleBox(1);
        } else if (entries.length > 0) {
            printAll();
        } else {
            alert("कृपया आधी फॉर्ममध्ये माहिती भरा kinva Entry Add करा!");
        }
        return;
    }
    
    // ========================================= */
    // CTRL + S = SAVE TO CONTACTS (TO + FROM)
    // ========================================= */
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        console.log('⌨️ Ctrl+S - Save to Contacts');
        
        const toName = document.getElementById('toName').value.trim();
        const toAddress = document.getElementById('toAddress').value.trim();
        const toMobile = document.getElementById('toMobile').value.trim();
        
        const fromName = document.getElementById('fromName').value.trim();
        const fromAddress = document.getElementById('fromAddress').value.trim();
        const fromMobile = document.getElementById('fromMobile').value.trim();
        
        let savedCount = 0;
        
        // TO contact save kara (Jar name asel tar)
        if (toName) {
            saveContact('to', {
                name: toName,
                address: toAddress,
                mobile: toMobile
            });
            savedCount++;
            console.log('✅ TO contact saved:', toName);
        }
        
        // FROM contact save kara (Jar name asel tar)
        if (fromName) {
            saveContact('from', {
                name: fromName,
                address: fromAddress,
                mobile: fromMobile
            });
            savedCount++;
            console.log('✅ FROM contact saved:', fromName);
        }
        
        // Sagle fields pan save kara
        saveAllFields();
        
        // User la message dाखवा
        if (savedCount > 0) {
            alert(`✅ ${savedCount} contact${savedCount > 1 ? 's' : ''} save zala${savedCount > 1 ? 't' : ''}!\n\n` +
                  `📱 TO Contacts मध्ये पाहण्यासाठी TO Name च्या शेजारी 👥 बटण दाबा..\n` +
                  `📱 FROM Contacts मध्ये पाहण्यासाठी FROM Name च्या शेजारी 👥 बटण दाबा.`);
        } else {
            alert("⚠️ Krupaya aadhi Name bhara (TO kinva FROM), mag Ctrl+S dabla!");
        }
        return;
    }
    
    // ========================================= */
    // ENTER = NEXT FIELD (Existing)
    // ========================================= */
    // Ha code existing ahe, tyala thevू naka
});

// ========================================= */
// PLUS BUTTON SHORTCUT (Add to List)
// ========================================= */
document.addEventListener('keydown', (e) => {
    // Jar user "+" key dabli tar Add to List
    if (e.key === '+' || e.key === '=') {
        // Jar input field madhe nasel tar
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && 
            (activeElement.tagName === 'INPUT' || 
             activeElement.tagName === 'TEXTAREA');
        
        if (!isInputFocused) {
            e.preventDefault();
            console.log('⌨️ + key - Add to List');
            addEntry();
        }
    }
});