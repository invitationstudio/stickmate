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
        alert("Krupaya aadhi Name bhara, mag save kara!");
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
        "R7-Left", "R7-Center", "R7-Right",
        "R8-Left", "R8-Center", "R8-Right"
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
            <button onclick="removeEntry(${index})">Remove</button>
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

// ** UPDATED: FROM Address ani Mobile ekाच line var **
function createStickerBox(boxNumber, data) {
    const pos = getPosition(boxNumber);
    const box = document.createElement('div');
    box.className = 'sticker-box';
    box.style.left = pos.left + 'cm';
    box.style.top = pos.top + 'cm';

    // FROM Address + Mobile ekत्र (Space ni separate)
    const fromAddressMobile = `${data.fromAddress}  ${data.fromMobile}`;

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
        alert("Krupaya aadhi form madhe details bhara!");
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
        alert("Krupaya aadhi entry add kara!");
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

// ================== INITIALIZE ==================
window.onload = () => {
    renderEntryList();
    generateBoxButtons();
};
// ================== PWA INSTALL LOGIC ==================
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Default browser prompt rokhा
    e.preventDefault();
    // Event save kara
    deferredPrompt = e;
    // Install button dाखवा
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'block';
    }
});

// Install button click
document.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response: ${outcome}`);
                deferredPrompt = null;
                installBtn.style.display = 'none';
            }
        });
    }
});

// App install zali tar button hide kara
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
});

// ================== SERVICE WORKER REGISTER ==================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}