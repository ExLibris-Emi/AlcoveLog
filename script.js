let mangaList = [];
let currentPage = 1;
const pageSize = 10;
let searchQuery = "";

let touchStartX = 0;
let touchEndX = 0;

// =========================
// LOAD FROM JSON
// =========================
fetch("./manga_history.json")
    .then(res => res.json())
    .then(data => {

        console.log("RAW DATA:", data); // 👈 ADD THIS

        mangaList = data.map(entry => ({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            title: entry.title,
            site: entry.site,
            chapter: entry.chapter || "N/A",
            firstRead: entry.first_read,
            lastRead: entry.last_read,
            url: entry.url,
            status: "Reading",
            history: entry.history || []
        }));

        console.log("MANGALIST:", mangaList); // 👈 ADD THIS

        renderList();
    })
    .catch(err => {
        console.error("FETCH FAILED:", err); // 👈 IMPORTANT
    });

// =========================
// SAVE (future use)
// =========================
function save() {
    localStorage.setItem("mangaList", JSON.stringify(mangaList));
}

// =========================
// ADD MANGA
// =========================
function addManga() {
    let title = prompt("Enter manga title:");
    if (!title) return;

    let site = prompt("What site are you reading it on?");
    if (!site) site = "Unknown";

    let manga = {
        title,
        site,
        chapter: "N/A",
        firstRead: new Date().toISOString(),
        lastRead: new Date().toISOString(),
        url: "",
        status: "Reading",
        history: [
            {
                action: "Started Reading",
                timestamp: new Date().toISOString()
            }
        ]
    };

    mangaList.push(manga);
    save();
    renderList();
}

// =========================
// MARK COMPLETE
// =========================
function markCompleted(id) {
    const manga = mangaList.find(m => m.id === id);
    if (!manga) return;

    manga.status = "Completed ✔️";
    manga.lastRead = new Date().toISOString();

    manga.history.push({
        action: "Completed",
        timestamp: new Date().toISOString()
    });

    save();
    renderList();
}

// =========================
// DELETE
// =========================
function deleteManga(id) {
    const index = mangaList.findIndex(m => m.id === id);

    if (index === -1) return;

    mangaList.splice(index, 1);

    save();
    renderList();
}

// =========================
// UPDATE LAST READ
// =========================
function updateLastRead(index) {
    mangaList[index].lastRead = new Date().toISOString();
    save();
    renderList();
}

// =========================
// RENDER LIST
// =========================
function renderList() {
    let list = document.getElementById("list");
    list.innerHTML = "";

    let filteredList = mangaList.filter(manga =>
        manga.title.toLowerCase().includes(searchQuery)
    );

    let start = (currentPage - 1) * pageSize;
    let end = start + pageSize;

    let pageItems = filteredList.slice(start, end);

    pageItems.forEach((manga, i) => {
        let index = start + i;

        let card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>
                <a href="${manga.url || '#'}" target="_blank">
                    ${manga.title}
                </a>
            </h3>

            <p>Site: ${manga.site}</p>

            <p><b>Chapter:</b> ${manga.chapter}</p>

            <p>Status: ${manga.status}</p>

            <button onclick="toggleHistory('${manga.id}', event)">Show History</button>
            <div id="history-${manga.id}" class="history-box"></div>

            <p class="first-read">📅 First Read: ${
                manga.firstRead
                    ? new Date(manga.firstRead).toLocaleString()
                    : "Unknown"
            }</p>

            <p>Last Read: ${
                manga.lastRead
                    ? new Date(manga.lastRead).toLocaleString()
                    : "Unknown"
            }</p>

            <button onclick="markCompleted('${manga.id}')">Complete</button>
            <button onclick="deleteManga('${manga.id}')">Delete</button>
        `;

        list.appendChild(card);
    });

    // page info
    let pageInfo = document.getElementById("pageInfo");

    if (pageInfo) {
        let maxPage = Math.ceil(filteredList.length / pageSize);
        pageInfo.innerText = `Page ${currentPage} / ${maxPage}`;
    }
}

// =========================
// SEARCH
// =========================
function handleSearch(value) {
    searchQuery = value.toLowerCase();
    currentPage = 1;
    renderList();
}

// =========================
// PAGINATION
// =========================
function nextPage() {
    let filteredList = mangaList.filter(manga =>
        manga.title.toLowerCase().includes(searchQuery)
    );

    let maxPage = Math.ceil(filteredList.length / pageSize);

    if (currentPage < maxPage) {
        currentPage++;
        renderList();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderList();
    }
}

// =========================
// HISTORY TOGGLE
// =========================
function toggleHistory(id, event) {
    const box = document.getElementById("global-history");
    if (!box) return;

    const manga = mangaList.find(m => m.id === id);
    const history = manga?.history || [];

    // close if already open
    if (box.dataset.openId === id && box.style.display === "block") {
        box.style.display = "none";
        box.dataset.openId = "";
        return;
    }

    // fill content
    box.innerHTML = history.length
        ? history.map(item => `
            <p>
                • <b>${item.action}</b><br>
                ${new Date(item.timestamp).toLocaleString()}
            </p>
        `).join("")
        : "<p>No history found</p>";

    // position near button
    const rect = event.target.getBoundingClientRect();

    box.style.top = rect.bottom + window.scrollY + "px";
    box.style.left = rect.left + "px";
    box.style.width = "220px";

    box.style.display = "block";
    box.dataset.openId = id;
}

// =========================
// SWIPE GESTURE
// =========================
document.addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", function (e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    let diff = touchStartX - touchEndX;

    if (Math.abs(diff) < 50) return;

    if (diff > 0) {
        nextPage();
    } else {
        prevPage();
    }
}