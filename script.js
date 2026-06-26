let mangaList = [];

// =========================
// LOAD FROM JSON (LIBRARY)
// =========================
fetch("./manga_history.json")
    .then(res => res.json())
    .then(data => {

        mangaList = data.map(entry => ({
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
    });


// =========================
// SAVE (for future manual edits)
// =========================
function save() {
    localStorage.setItem("mangaList", JSON.stringify(mangaList));
}


// =========================
// ADD MANGA MANUALLY
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
function markCompleted(index) {
    mangaList[index].status = "Completed ✔️";
    mangaList[index].lastRead = new Date().toISOString();

    mangaList[index].history.push({
        action: "Completed",
        timestamp: new Date().toISOString()
    });

    save();
    renderList();
}


// =========================
// DELETE MANGA
// =========================
function deleteManga(index) {
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
// RENDER UI
// =========================
function renderList() {
    let list = document.getElementById("list");
    list.innerHTML = "";

    mangaList.forEach((manga, index) => {

        let card = document.createElement("div");

        card.style.background = "#1f2937";
        card.style.position = "relative";
        card.style.padding = "15px";
        card.style.borderRadius = "12px";
        card.style.margin = "10px 0";
        card.style.color = "white";

        card.innerHTML = `
            <h3>
                <a href="${manga.url || '#'}" target="_blank">
                    ${manga.title}
                </a>
            </h3>

            <p>Site: ${manga.site}</p>

            <p><b>Chapter:</b> ${manga.chapter}</p>

            <p>Status: ${manga.status}</p>

            <button onclick="toggleHistory(${index})">Show History</button>
            <div id="history-${index}" class="history-box"></div>

            <p>First Read: ${
                manga.firstRead
                    ? new Date(manga.firstRead).toLocaleString()
                    : "Unknown"
            }</p>

            <p>Last Read: ${
                manga.lastRead
                    ? new Date(manga.lastRead).toLocaleString()
                    : "Unknown"
            }</p>

            <button onclick="markCompleted(${index})">Complete</button>
            <button onclick="deleteManga(${index})">Delete</button>
        `;

        list.appendChild(card);
    });
}


// =========================
// TOGGLE HISTORY
// =========================
function toggleHistory(index) {
    let box = document.getElementById(`history-${index}`);

    if (!box.style.display || box.style.display === "none") {
        box.style.display = box.style.display === "block" ? "none" : "block";

        const history = mangaList[index]?.history || [];

        box.innerHTML = history.length
            ? history.map(item => {
                return `
                    <p>
                        • <b>${item.action}</b><br>
                        ${new Date(item.timestamp).toLocaleString()}
                    </p>
                `;
            }).join("")
            : "<p>No history found</p>";

    } else {
        box.style.display = "none";
    }
}


// initial render (safe fallback)
renderList();