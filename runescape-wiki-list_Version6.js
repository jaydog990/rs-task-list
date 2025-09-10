const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQK-HqUIuZbSx53ZjD-Y-h8r9sqaZ3lv0Ol3Rq8lNKdp1CFcFxQNi9LP1hBGIPkybBVI5O8KDhrHFeJ/pub?gid=0&single=true&output=csv";
const tableBody = document.querySelector("#tasks-table tbody");
const toggleDarkBtn = document.getElementById("toggle-dark");
const searchInput = document.getElementById("search");

let allTasks = [];

// Parse CSV function (supports commas inside quotes)
function parseCSV(text) {
  const lines = text.trim().split('\n');
  return lines.map(line => {
    const cells = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i+1] === '"') { cell += '"'; i++; }
      else if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { cells.push(cell); cell = ''; }
      else cell += char;
    }
    cells.push(cell);
    return cells;
  });
}

// Save completed tasks in localStorage
function saveCompleted(tasks) {
  localStorage.setItem('rswiki_completed', JSON.stringify(tasks));
}
function loadCompleted() {
  return JSON.parse(localStorage.getItem('rswiki_completed') || '[]');
}
let completedTasks = loadCompleted();

// Render the table
function renderTasks(tasks) {
  tableBody.innerHTML = '';
  tasks.forEach(row => {
    // row indices: 0 = Task, 1 = Description, 2 = Points, 3 = Category/Accumulated Points
    if (row.length < 4) return; // skip short rows
    const tr = document.createElement("tr");

    // Only use Task (0), Points (2), Accumulated Points (3)
    const displayIndices = [0, 2, 3];
    displayIndices.forEach(i => {
      const td = document.createElement("td");
      td.textContent = row[i] || '';
      tr.appendChild(td);
    });

    // Highlight if completed
    if (completedTasks.includes(row[0])) tr.classList.add("completed-task");

    // Click anywhere on row to toggle completed
    tr.addEventListener("click", function() {
      const taskId = row[0];
      const idx = completedTasks.indexOf(taskId);
      if (idx > -1) {
        completedTasks.splice(idx, 1);
        tr.classList.remove("completed-task");
      } else {
        completedTasks.push(taskId);
        tr.classList.add("completed-task");
      }
      saveCompleted(completedTasks);
    });

    tableBody.appendChild(tr);
  });
}

// Fetch CSV, parse, and render
fetch(sheetUrl)
  .then(r => r.text())
  .then(text => {
    const rows = parseCSV(text);
    allTasks = rows.slice(1); // skip header
    renderTasks(allTasks);
  });

// Filter/search
searchInput.addEventListener('input', function() {
  const q = this.value.toLowerCase();
  renderTasks(allTasks.filter(
    row => [0,2,3].some(i => (row[i] || '').toLowerCase().includes(q))
  ));
});

// Dark mode toggle
toggleDarkBtn.onclick = () => {
  document.body.classList.toggle("light-mode");
};