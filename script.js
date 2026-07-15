let mangaList = [];
let currentPage = 1;
const pageSize = 10;
let searchQuery = "";
let lastDataHash = "";

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

            id:
                Date.now().toString(36) +
                Math.random().toString(36).substr(2, 9),

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

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} | ${hours}:${minutes}`;

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


        let card =
            document.createElement("div");


        card.className = "card";



        card.innerHTML = `

        <h3>
            <a href="${manga.url || '#'}" target="_blank">
                ${manga.title}
            </a>
        </h3>


        <p>Site: ${manga.site}</p>


        <p>
        <b>Chapter:</b>
        ${manga.chapter}
        </p>


        <p>
        Status:
        ${manga.status}
        </p>


        <button onclick="toggleHistory('${manga.id}', event)">
        Show History
        </button>


        <p>
        📅 First Read:
        ${formatDate(manga.firstRead)}
        </p>


        <p>
        Last Read:
        ${formatDate(manga.lastRead)}
        </p>

        `;


        list.appendChild(card);


    });



    let pageInfo =
        document.getElementById("pageInfo");


    if(pageInfo){

        let maxPage =
            Math.ceil(filteredList.length / pageSize);

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



// =========================
// PAGINATION
// =========================

function nextPage(){

    currentPage++;

    renderList();

}



function prevPage(){

    if(currentPage > 1){

        currentPage--;

        renderList();

    }

}



// =========================
// HISTORY
// =========================

function toggleHistory(id,event){


    const box =
        document.getElementById(
            "global-history"
        );


    if(!box) return;



    const manga =
        mangaList.find(
            m => m.id === id
        );


    const history =
        manga?.history || [];



    box.innerHTML =
        history.length

        ?

        history.map(item => `

        <p>
        • <b>${item.action}</b><br>
        ${new Date(item.timestamp).toLocaleString()}
        </p>

        `).join("")


        :

        "<p>No history found</p>";



    box.style.display="block";

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