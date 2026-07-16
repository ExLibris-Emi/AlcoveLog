let mangaList = [];
let currentPage = 1;
const pageSize = 10;
let searchQuery = "";
let lastDataHash = "";
let selectedMangaId = null;
let selectedHistoryMangaId = null;
let touchStartX = 0;
let touchEndX = 0;


// =========================
// LOAD FROM JSON
// =========================

async function loadData() {

    try {

        const res = await fetch("./manga_history.json?t=" + Date.now());

        const data = await res.json();


        const newHash = JSON.stringify(
            data.map(m => ({
                title: m.title,
                chapter: m.chapter,
                last_read: m.last_read
            }))
        );


        if (newHash === lastDataHash) {
            return;
        }


        lastDataHash = newHash;


        mangaList = data.map(entry => ({

            id: btoa(entry.url || entry.title)
                .replace(/[^a-zA-Z0-9]/g, "")
                .substring(0, 20),

            title: entry.title,

            site: entry.site,

            chapter: entry.chapter || "N/A",

            firstRead: entry.first_read,

            lastRead: entry.last_read,

            url: entry.url,

            status: "Reading",

            history: entry.history || []

        }));


        renderList();


    } catch (err) {

        console.error("FETCH FAILED:", err);

    }

}


// initial load
loadData();


// check for updates every 3 seconds
setInterval(loadData, 3000);



// =========================
// SAVE
// =========================

function save() {

    localStorage.setItem(
        "mangaList",
        JSON.stringify(mangaList)
    );

}


function formatDate(dateString) {

    if (!dateString) return "Unknown";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    
    hours = String(hours).padStart(2, "0");
    
    return `${day}/${month}/${year} | ${hours}:${minutes} ${ampm}`;
}

// =========================
// RENDER LIST
// =========================

function renderList() {


    mangaList.sort(
        (a, b) =>
        new Date(b.lastRead) -
        new Date(a.lastRead)
    );


    let list = document.getElementById("list");


    if (!list) return;


    list.innerHTML = "";



    let filteredList =
        mangaList.filter(manga =>
            manga.title
            .toLowerCase()
            .includes(searchQuery)
        );



    let start =
        (currentPage - 1) * pageSize;


    let pageItems =
        filteredList.slice(
            start,
            start + pageSize
        );



    pageItems.forEach(manga => {


        let card = document.createElement("div");
        
        card.className = "archive-entry";
        
    card.innerHTML = `
    
    <div class="archive-info">
    
    <h3>
    <a href="${manga.url || '#'}" target="_blank">
    ${manga.title}
    </a>
    </h3>
    
    <p>
    Status: ${manga.status}
    </p>
    
    <p>
    First Read:
    ${formatDate(manga.firstRead)}
    </p>

    <p>
    Last Read:
    ${formatDate(manga.lastRead)}
    </p>

    </div>

    <button onclick="toggleHistory('${manga.id}', event)">
    Record Log
    </button>

    `;


        list.appendChild(card);


    });



    let pageInfo =
        document.getElementById("pageInfo");


    if(pageInfo){

        let maxPage =
            Math.ceil(filteredList.length / pageSize);


        if(currentPage > maxPage){

            currentPage = maxPage || 1;
        
        }


        pageInfo.innerText =
            `Page ${currentPage} / ${maxPage}`;
    
    }

}



// =========================
// SEARCH
// =========================

function handleSearch(value){

    searchQuery =
        value.toLowerCase();

    currentPage = 1;

    renderList();

}

function clearSearch(){

    const box = document.getElementById("searchBox");

    box.value = "";

    searchQuery = "";

    currentPage = 1;

    renderList();

}



// =========================
// PAGINATION
// =========================

function nextPage(){

    const filteredList =
        mangaList.filter(manga =>
            manga.title
            .toLowerCase()
            .includes(searchQuery)
        );


    const maxPage =
        Math.ceil(filteredList.length / pageSize);


    if(currentPage < maxPage){

        currentPage++;

        renderList();

    }

}



function prevPage(){

    if(currentPage > 1){

        currentPage--;

        renderList();

    }

}



// =========================
// RECORD LOG
// =========================

function toggleHistory(id,event){

    selectedMangaId = id;

    const box =
        document.getElementById(
            "record-log-popup"
        );

    if(!box) return;


    const manga =
        mangaList.find(
            m => m.id === id
        );


    if(!manga) return;


    box.innerHTML = `

    <h2>📖 Record Log</h2>

    <hr>

    <h3>
    <a href="${manga.url || '#'}" target="_blank">
        ${manga.title}
    </a>
    </h3>

    <div class="record-row">
        <span>Site</span>
        <span>${manga.site}</span>
    </div>

    <div class="record-row">
        <span>Status</span>
        <span>${manga.status}</span>
    </div>

    <div class="record-row">
        <span>First Read</span>
        <span>${formatDate(manga.firstRead)}</span>
    </div>

    <div class="record-row">
        <span>Last Read</span>
        <span>${formatDate(manga.lastRead)}</span>
    </div>

    <div class="record-row">
        <span>Chapter</span>
        <span>${manga.chapter}</span>
    </div>

    <hr>

    <button onclick="openReadingHistory()">
        📖 Reading History →
    </button>

    <div class="popup-actions">
        <button onclick="closeRecordLog()">
            Close
        </button>

        <button class="delete-btn" onclick="openDeletePopup()">
            Delete
        </button>
    </div>
    `;


    box.style.display = "block";

}

function closeRecordLog(){

    document.getElementById(
        "record-log-popup"
    ).style.display = "none";

    document.getElementById(
        "reading-history-popup"
    ).style.display = "none";

}

function openReadingHistory(){

    const historyBox =
        document.getElementById(
            "reading-history-popup"
        );


    if(!historyBox) return;


    const manga =
        mangaList.find(
            m => m.id === selectedMangaId
        );


    const history =
        manga?.history || [];


    historyBox.innerHTML = `

        <h2>Reading History</h2>

        ${
            history.length

            ?

            history.map(item => `

            <p>
            • ${item.action}<br>
            ${formatDate(item.timestamp)}
            </p>

            `).join("")

            :

            "<p>No history found</p>"
        }


        <button onclick="closeReadingHistory()">
        Close
        </button>

    `;


    historyBox.style.display = "block";

}

function closeReadingHistory(){

    document.getElementById(
        "reading-history-popup"
    ).style.display = "none";

}



// =========================
// SWIPE
// =========================

document.addEventListener(
"touchstart",
function(e){

touchStartX =
e.changedTouches[0].screenX;

});



document.addEventListener(
"touchend",
function(e){

touchEndX =
e.changedTouches[0].screenX;

let diff =
touchStartX - touchEndX;


if(Math.abs(diff)<50)
return;


if(diff>0)
nextPage();
else
prevPage();


});