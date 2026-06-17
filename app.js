﻿const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const monthNames = [
"January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December",
];
const periodTimes = {
    1: "7g30-8g20",
    2: "8g20-9g10",
    3: "9g10-10g00",
    4: "10g10-11g00",
    5: "11g00-11g50",
    6: "12g40-13g30",
    7: "13g30-14g20",
    8: "14g20-15g10",
    9: "15g20-16g10",
    10: "16g10-17g00"
};

const topics = [
"Family",
"School",
"Friend",
"Travel",
"Technology",
"Sports",
"Environment",
"Health",
];
const reviewDays = [1, 3, 7, 14, 30];
const corrections = {
enviroment: "environment",
becuase: "because",
freind: "friend",
recieve: "receive",
seperate: "separate",
definately: "definitely",
grammer: "grammar",
writting: "writing",
};

const grammarRules = [
  {
    type: "grammar",
    pattern: /\bi am\b/i,
    fix: "I am",
    explain: "Always capitalize 'I'"
  },
  {
    type: "grammar",
    pattern: /\b(i|he|she)\s+go\b/i,
    fix: (m) => m.replace("go", "goes"),
    explain: "Third person singular needs 's'"
  },
  {
    type: "style",
    pattern: /\bvery good\b/i,
    fix: "excellent",
    explain: "Use stronger adjective instead of 'very good'"
  }
];

const sampleCourses = [
{
name: "Lap trinh C++",
day: 4,
start_period: 1,
end_period: 4,
room: "P.cs2:NDH5.5",
},
{ name: "Tieng Anh", day: 2, start_period: 3, end_period: 5, room: "B203" },
{
name: "Co so du lieu",
day: 5,
start_period: 6,
end_period: 8,
room: "A101",
},
{ name: "The duc", day: 7, start_period: 1, end_period: 2, room: "San 2" },
];
const defaultData = {
classes: [
{
id: crypto.randomUUID(),
subject: "Mathematics",
time: "07:30",
place: "Room A2",
note: "Linear equations",
},
{
id: crypto.randomUUID(),
subject: "English",
time: "14:00",
place: "Library",
note: "Podcast notes",
},
{
id: crypto.randomUUID(),
subject: "Self Study",
time: "20:00",
place: "Desk",
note: "Review vocabulary",
},
],
reminders: [
{ id: crypto.randomUUID(), text: "English quiz", time: "2026-06-10T19:30" },
{
id: crypto.randomUUID(),
text: "Submit history homework",
time: "2026-06-12T08:00",
},
],
planner: {},
words: [
{
id: crypto.randomUUID(),
word: "environment",
meaning: "moi truong",
pron: "/in-VAI-ren-ment/",
example: "We should protect the environment every day.",
added: "2026-06-10",
},
{
id: crypto.randomUUID(),
word: "routine",
meaning: "thoi quen",
pron: "/roo-TEEN/",
example: "My morning routine starts with reading.",
added: "2026-06-09",
},
{
id: crypto.randomUUID(),
word: "improve",
meaning: "cai thien",
pron: "/im-PROOV/",
example: "Practice helps me improve my writing.",
added: "2026-06-08",
},
{
id: crypto.randomUUID(),
word: "deadline",
meaning: "han chot",
pron: "/DED-line/",
example: "The project deadline is Friday.",
added: "2026-06-07",
},
],
progress: [2.5, 1.75, 3, 2.25, 4, 1.5, 2.75],
generatedCourses: sampleCourses,
};
let state = loadState();
let currentDate = new Date();
let selectedDate = new Date();

let playerIndex = 0;
let hiddenWord = "";
let currentAudioUrl = "";

function loadState() {
const saved = localStorage.getItem("personalStudyHub");
if (!saved) return structuredClone(defaultData);
try {
return { ...structuredClone(defaultData), ...JSON.parse(saved) };
} catch {
return structuredClone(defaultData);
}
}

function saveState() {
localStorage.setItem("personalStudyHub", JSON.stringify(state));
updateStats();
drawProgress();
}

function dateKey(date) {
return date.toISOString().slice(0, 10);
}

function displayDate(date) {
return date.toLocaleDateString("en-GB", {
day: "2-digit",
month: "short",
year: "numeric",
});
}
function init() {
$("#todayLabel").textContent = new Date().toLocaleDateString("en-GB", {
weekday: "long",
day: "2-digit",
month: "short",
year: "numeric",
});
setupMonthSelect();
bindNavigation();
bindForms();
bindEnglish();
bindTheme();
bindTimetableGenerator();
renderAll();
setInterval(autoEyeProtection, 60000);
}
function setupMonthSelect() {
const select = $("#monthSelect");
select.innerHTML = monthNames
.map((name, index) => `<option value="${index}">${name}</option>`)
.join("");
select.addEventListener("change", () => {
currentDate.setMonth(Number(select.value));
renderCalendar();
});
$("#yearInput").addEventListener("change", (event) => {
currentDate.setFullYear(Number(event.target.value));
renderCalendar();
});
}
function bindNavigation() {
$$(".nav-btn").forEach((button) =>
button.addEventListener("click", () => {
$$(".nav-btn").forEach((item) => item.classList.remove("active"));
button.classList.add("active");
$$(".view").forEach((view) => view.classList.remove("active"));
$(`#${button.dataset.view}View`).classList.add("active");
drawProgress();
})
);
$("#prevMonth").addEventListener("click", () => {
currentDate.setMonth(currentDate.getMonth() - 1);
renderCalendar();
});
$("#nextMonth").addEventListener("click", () => {
currentDate.setMonth(currentDate.getMonth() + 1);
renderCalendar();
});
$("#todayBtn").addEventListener("click", () => {
currentDate = new Date();
selectedDate = new Date();
renderAll();
});
$("#clearDoneBtn").addEventListener("click", () => {
const key = dateKey(selectedDate);
state.planner[key] = (state.planner[key] || []).filter(
(item) => !item.done
);
saveState();
renderPlanner();
renderCalendar();
});
}
function bindForms() {
$("#plannerForm").addEventListener("submit", (event) => {
event.preventDefault();
const key = dateKey(selectedDate);
state.planner[key] ??= [];
state.planner[key].push({
id: crypto.randomUUID(),
title: $("#plannerInput").value.trim(),
type: $("#plannerType").value,
done: false,
});
event.target.reset();
saveState();
renderPlanner();
renderCalendar();
});
$("#classForm").addEventListener("submit", (event) => {
event.preventDefault();
state.classes.push({
id: crypto.randomUUID(),
subject: $("#subjectInput").value.trim(),
time: $("#timeInput").value,
place: $("#placeInput").value.trim(),
note: $("#noteInput").value.trim(),
});
event.target.reset();
sortClasses();
saveState();
renderClasses();
renderCalendar();
});
$("#reminderForm").addEventListener("submit", (event) => {
event.preventDefault();
state.reminders.push({
id: crypto.randomUUID(),
text: $("#reminderText").value.trim(),
time: $("#reminderTime").value,
});
event.target.reset();
saveState();
renderReminders();
renderCalendar();
});
}


function bindDictionaryAudio(word) {
  const btn = document.getElementById("speakDictWord");
  const bars = document.getElementById("dictBars");

  if (!btn) return;

  btn.onclick = () => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";

    btn.classList.add("active");
    bars?.classList.add("active");

    u.onend = () => {
      btn.classList.remove("active");
      bars?.classList.remove("active");
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };
}

function bindTimetableGenerator() {
$("#loadSampleCourses").addEventListener("click", () => {
$("#courseRawInput").value = JSON.stringify(sampleCourses, null, 2);
state.generatedCourses = structuredClone(sampleCourses);
saveState();
renderCourseEditors();
renderVisualTimetable();
});

$("#generateTimetable").addEventListener("click", () => {
state.generatedCourses = parseCourseInput(
$("#courseRawInput").value,
$("#courseNameHint").value.trim() || "Mon hoc"
);
saveState();
renderCourseEditors();
renderVisualTimetable();
});

$("#exportTimetableHtml").addEventListener("click", exportTimetableHtml);

$("#saveEditedTimetable").addEventListener("click", () => {
saveState();
alert("Đã lưu thay đổi thành công!");
});
}
function parseCourseInput(raw, fallbackName) {
const trimmed = raw.trim();
if (!trimmed) return structuredClone(sampleCourses);
try {
const parsed = JSON.parse(trimmed);
const rows = Array.isArray(parsed) ? parsed : [parsed];
return rows.map(normalizeCourse).filter(Boolean);
} catch {
return parseOcrLines(trimmed, fallbackName);
}
}
function normalizeCourse(row) {
const day = Number(row.day ?? row.DayOfWeek ?? row.dayOfWeek);
const start = Number(row.start_period ?? row.startPeriod ?? row.StartPeriod);
const end = Number(row.end_period ?? row.endPeriod ?? row.EndPeriod);
const name = String(row.name ?? row.Name ?? "Mon hoc").trim();
const room = String(row.room ?? row.Room ?? "").trim();
if (!isValidCourse({ day, start_period: start, end_period: end }))
return null;
return { name, day, start_period: start, end_period: end, room };
}
function parseOcrLines(raw, fallbackName) {
return raw
.split(/\n+/)
.map((line) => line.trim())
.filter(Boolean)
.map((line) => {
const parsed = parseScheduleCode(line);
if (!parsed) return null;
const beforeCode = line
.split(/T[2-7]\s*\(/i)[0]
.replace(/[,:;-]+$/g, "")
.trim();
return { name: beforeCode || fallbackName, ...parsed };
})
.filter(Boolean);
}
function parseScheduleCode(text) {
const pattern =
/T\s*([2-7])\s*\(\s*(\d{1,2})\s*-\s*(\d{1,2})\s*\)\s*-?\s*(.+)$/i;
const match = text.match(pattern);
if (!match) return null;
const course = {
day: Number(match[1]),
start_period: Number(match[2]),
end_period: Number(match[3]),
room: match[4].trim(),
};
return isValidCourse(course) ? course : null;
}
function isValidCourse(course) {
return (
Number.isInteger(course.day) &&
course.day >= 2 &&
course.day <= 7 &&
Number.isInteger(course.start_period) &&
Number.isInteger(course.end_period) &&
course.start_period >= 1 &&
course.end_period <= 10 &&
course.start_period <= course.end_period
);
}
function buildTimetableGrid(courses) {
const grid = Array.from({ length: 10 }, () =>
Array.from({ length: 6 }, () => ({ type: "EMPTY" }))
);
courses.forEach((course, index) => {
if (!isValidCourse(course)) return;
const col = course.day - 2;
const start = course.start_period - 1;
const end = course.end_period - 1;
if (grid[start][col].type !== "EMPTY") return;
grid[start][col] = {
type: "COURSE",
course,
rowspan: end - start + 1,
index,
};
for (let row = start + 1; row <= end; row++)
grid[row][col] = { type: "MERGED_CELL", parent: index };
});
return grid;
}

function renderCourseEditors() {
    const list = $("#parsedCourses");
    const courses = state.generatedCourses || [];

    let html = `
    <div class="course-editor-header">
        <div>Môn học</div>
        <div>Thứ</div>
        <div>Tiết đầu</div>
        <div>Tiết cuối</div>
        <div>Phòng học</div>
        <div>Xóa</div>
    </div>
    `;

    html += courses.map((course, index) => `
        <div class="course-editor" data-index="${index}">
            <input
                data-field="name"
                value="${escapeAttr(course.name)}"
                placeholder="Môn học"
            />

            <input
                data-field="day"
                type="number"
                min="2"
                max="7"
                value="${course.day}"
                placeholder="Thứ"
            />

            <input
                data-field="start_period"
                type="number"
                min="1"
                max="10"
                value="${course.start_period}"
                placeholder="Tiết đầu"
            />

            <input
                data-field="end_period"
                type="number"
                min="1"
                max="10"
                value="${course.end_period}"
                placeholder="Tiết cuối"
            />

            <input
                data-field="room"
                value="${escapeAttr(course.room)}"
                placeholder="Phòng học"
            />

            <button
                class="delete-btn"
                data-delete-course="${index}"
                type="button">
                ×
            </button>
        </div>
    `).join("");
    html += `
            <div class="course-editor-actions">
                <button id="addCourseBtn" class="primary-btn" type="button">
                    + Thêm môn học
                </button>
            </div>
            `;

    list.innerHTML = html;

    list.querySelectorAll("input").forEach((input) =>
        input.addEventListener("input", updateCourseFromEditor)
    );

    list.querySelectorAll("[data-delete-course]") 
    .forEach((button) =>
        button.addEventListener("click", () => {
            state.generatedCourses.splice(
                Number(button.dataset.deleteCourse),
                1
            );

            saveState();
            renderCourseEditors();
            renderVisualTimetable();
        })

    );
    $("#addCourseBtn")?.addEventListener("click", () => {

    state.generatedCourses.push({
        name: "Môn học mới",
        day: 2,
        start_period: 1,
        end_period: 1,
        room: ""
    });

    saveState();
    renderCourseEditors();
    renderVisualTimetable();
});

}

function updateCourseFromEditor(event) {
const editor = event.target.closest(".course-editor");
const index = Number(editor.dataset.index);
const field = event.target.dataset.field;
const value = ["day", "start_period", "end_period"].includes(field)
? Number(event.target.value)
: event.target.value;
state.generatedCourses[index][field] = value;
saveState();
renderVisualTimetable();
}
function renderVisualTimetable() {
const target = $("#visualTimetable");
const courses = (state.generatedCourses || []).filter(isValidCourse);
const grid = buildTimetableGrid(courses);

let html = `
<section class="tkb-export">
<h1 class="tkb-title">Thời Khóa Biểu</h1>

<table class="tkb-table">
<thead>
<tr>
    <th>TIẾT</th>
    <th>THỜI GIAN</th>
    <th>THỨ 2</th>
    <th>THỨ 3</th>
    <th>THỨ 4</th>
    <th>THỨ 5</th>
    <th>THỨ 6</th>
    <th>THỨ 7</th>
</tr>
</thead>
<tbody>
`;

for (let period = 1; period <= 10; period++) {
html += `
<tr>
    <th>${period}</th>
    <td>${periodTimes[period]}</td>
`;

for (let col = 0; col < 6; col++) {
const cell = grid[period - 1][col];
if (cell.type === "MERGED_CELL") continue;
if (cell.type === "COURSE")
html += `<td class="course-cell" rowspan="${ cell.rowspan }"><strong>${escapeHtml(cell.course.name)}</strong><span>Tiet ${ cell.course.start_period }-${cell.course.end_period}</span><span>${escapeHtml( cell.course.room )}</span></td>`;
else html += `<td class="empty-cell">-</td>`;
}
html += `</tr>`;
}
html += `</tbody></table></section>`;
target.innerHTML = html;
}
function exportTimetableHtml() {
const table = $("#visualTimetable").innerHTML || "";
const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Thoi Khoa Bieu</title><style>body{margin:0;padding:32px;background:#10131a;color:#f7f7f7}.tkb-export{max-width:1100px;margin:auto;padding:24px;background:linear-gradient(135deg,#1b2433,#111827);border-radius:12px}.tkb-title{text-align:center;font-family:'Brush Script MT','Segoe Script',cursive;font-size:48px}

.tkb-table{
    width:100%;
    border-collapse:collapse;
    table-layout:auto;
    font-family:'Times New Roman',serif
}

.tkb-table th,.tkb-table td{border:2px solid #88c7ff;padding:14px;text-align:center;vertical-align:middle}.tkb-table th{background:#164e80}.course-cell{background:#1d4ed8}.course-cell span{display:block;margin-top:5px}.empty-cell{color:#777}</style></head><body>${table}</body></html>`;

const blob = new Blob([html], { type: "text/html" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "thoi-khoa-bieu.html";
link.click();
URL.revokeObjectURL(url);
}
function escapeHtml(value) {
return String(value).replace(
/[&<>"]/g,
(char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char])
);
}
function escapeAttr(value) {
return escapeHtml(value).replace(/'/g, "&#39;");
}
function bindEnglish() {
$$(".tab-btn").forEach((button) =>
button.addEventListener("click", () => {
$$(".tab-btn").forEach((item) => item.classList.remove("active"));
$$(".tab-panel").forEach((panel) => panel.classList.remove("active"));
button.classList.add("active");
$(`#${button.dataset.tab}Tab`).classList.add("active");
})
);
$("#vocabForm").addEventListener("submit", (event) => {
event.preventDefault();
state.words.unshift({
id: crypto.randomUUID(),
word: $("#wordInput").value.trim(),
meaning: $("#meaningInput").value.trim(),
pron: $("#pronInput").value.trim(),
example: $("#exampleInput").value.trim(),
added: dateKey(new Date()),
});
event.target.reset();
saveState();
renderWords();
renderPlayer();
renderReview();
makeHiddenWord();
});
$("#seedWordsBtn").addEventListener("click", () => {
state.words = structuredClone(defaultData.words);
saveState();
renderWords();
renderPlayer();
renderReview();
makeHiddenWord();
});
$("#hiddenForm").addEventListener("submit", (event) => {
event.preventDefault();
const answer = $("#hiddenAnswer").value.trim().toLowerCase();
$("#hiddenResult").innerHTML =
answer === hiddenWord.toLowerCase()
? `<strong class="ok-text">Correct:</strong> ${hiddenWord}`
: `<strong class="bad-text">Try again:</strong> ${hiddenWord}`;
});
$("#makeParagraph").addEventListener("click", renderParagraph);


$("#prevWord").addEventListener("click", () => {

if (!state.words.length) return;

playerIndex =
(playerIndex - 1 + state.words.length) %
state.words.length;

renderPlayer();
});


$("#nextWord").addEventListener("click", () => {

if (!state.words.length) return;

playerIndex = (playerIndex + 1) % state.words.length;

renderPlayer();
});

$("#speakWord").addEventListener("click", speakCurrentWord);
$("#detectWords").addEventListener("click", detectVocabulary);
$("#checkWriting").addEventListener("click", checkWriting);
$("#searchDictionary").addEventListener("click", searchWord);













$("#topicChips").innerHTML = topics
.map(
(topic) =>
`<button class="chip" data-topic="${topic}" type="button">${topic}</button>`
)
.join("");
$$("#topicChips .chip").forEach((chip) =>
chip.addEventListener("click", () => makeIdea(chip.dataset.topic))
);
}
function bindTheme() {
$$(".swatch").forEach((button) =>
button.addEventListener("click", () => {
document.body.dataset.theme = button.dataset.theme;
$$(".swatch").forEach((item) => item.classList.remove("active"));
button.classList.add("active");
drawProgress();
})
);
$("#eyeMode").addEventListener("change", (event) =>
document.body.classList.toggle("eye-mode", event.target.checked)
);
}
function renderAll() {
sortClasses();
renderCalendar();
renderPlanner();
renderClasses();
renderReminders();
renderWords();
renderPlayer();
renderReview();
makeHiddenWord();
renderParagraph();
makeIdea("School");
renderCourseEditors();

renderVisualTimetable();
updateStats();
requestAnimationFrame(drawProgress);
}
function renderCalendar() {
const grid = $("#calendarGrid"),
year = currentDate.getFullYear(),
month = currentDate.getMonth();
$("#monthLabel").textContent = `${monthNames[month]} ${year}`;
$("#monthSelect").value = month;
$("#yearInput").value = year;
const first = new Date(year, month, 1),
start = new Date(first),
mondayOffset = (first.getDay() + 6) % 7;
start.setDate(first.getDate() - mondayOffset);
const todayKey = dateKey(new Date()),
selectedKey = dateKey(selectedDate);
let html = "";
for (let i = 0; i < 42; i++) {
const day = new Date(start);
day.setDate(start.getDate() + i);
const key = dateKey(day),
eventCount = countEventsForDate(key);
html += `<button class="day-cell ${day.getMonth() !== month ? "dim" : ""} ${ key === todayKey ? "today" : "" } ${ key === selectedKey ? "selected" : "" }" data-date="${key}" type="button"><strong>${day.getDate()}</strong><span class="dot-row">${Array.from( { length: Math.min(eventCount, 3) }, () => `<i class="event-dot"></i>` ).join("")}</span></button>`;
}
grid.innerHTML = html;
$$(".day-cell").forEach((button) =>
button.addEventListener("click", () => {
selectedDate = new Date(`${button.dataset.date}T12:00:00`);
currentDate = new Date(selectedDate);
renderCalendar();
renderPlanner();
})
);
}
function countEventsForDate(key) {
return (
(state.planner[key] || []).length +
state.reminders.filter((item) => item.time?.slice(0, 10) === key).length +
(key === dateKey(new Date()) ? state.classes.length : 0)
);
}
function renderPlanner() {
const key = dateKey(selectedDate),
items = state.planner[key] || [];
$("#selectedDateLabel").textContent = displayDate(selectedDate);
$("#plannerList").innerHTML = items.length
? items
.map(
(item) =>
`<article class="item-card ${ item.done ? "done" : "" }"><input type="checkbox" ${ item.done ? "checked" : "" } data-action="togglePlanner" data-id="${ item.id }" /><div><span class="badge">${ item.type }</span><div class="item-title">${ item.title }</div></div><button class="delete-btn" data-action="deletePlanner" data-id="${ item.id }" type="button">×</button></article>`
)
.join("")
: `<div class="result-box">No items.</div>`;
$$('[data-action="togglePlanner"]').forEach((input) =>
input.addEventListener("change", () => {
const item = state.planner[key].find(
(entry) => entry.id === input.dataset.id
);
item.done = input.checked;
saveState();
renderPlanner();
})
);
$$('[data-action="deletePlanner"]').forEach((button) =>
button.addEventListener("click", () => {
state.planner[key] = state.planner[key].filter(
(item) => item.id !== button.dataset.id
);
saveState();
renderPlanner();
renderCalendar();
})
);
}
function sortClasses() {
state.classes.sort((a, b) => a.time.localeCompare(b.time));
}
function renderClasses() {
$("#classList").innerHTML = state.classes
.map(
(item) =>
`<article class="time-card"><div class="time-pill">${ item.time }</div><div><strong>${item.subject}</strong><p>${item.place} · ${ item.note || "No note" }</p></div><div class="card-actions"><button class="edit-btn" data-action="editClass" data-id="${ item.id }" type="button">✎</button><button class="delete-btn" data-action="deleteClass" data-id="${ item.id }" type="button">×</button></div></article>`
)
.join("");
$$('[data-action="deleteClass"]').forEach((button) =>
button.addEventListener("click", () => {
state.classes = state.classes.filter(
(item) => item.id !== button.dataset.id
);
saveState();
renderClasses();
renderCalendar();
})
);
$$('[data-action="editClass"]').forEach((button) =>
button.addEventListener("click", () => {
const item = state.classes.find(
(entry) => entry.id === button.dataset.id
);
$("#subjectInput").value = item.subject;
$("#timeInput").value = item.time;
$("#placeInput").value = item.place;
$("#noteInput").value = item.note;
state.classes = state.classes.filter(
(entry) => entry.id !== button.dataset.id
);
saveState();
renderClasses();
})
);
}
function renderReminders() {
state.reminders.sort((a, b) => a.time.localeCompare(b.time));
$("#reminderList").innerHTML = state.reminders
.map(
(item) =>
`<article class="item-card"><span class="badge">${new Date( item.time ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", })}</span><div><strong>${ item.text }</strong><div class="word-meta">${new Date( item.time ).toLocaleDateString( "en-GB" )}</div></div><button class="delete-btn" data-action="deleteReminder" data-id="${ item.id }" type="button">×</button></article>`
)
.join("");
$$('[data-action="deleteReminder"]').forEach((button) =>
button.addEventListener("click", () => {
state.reminders = state.reminders.filter(
(item) => item.id !== button.dataset.id
);
saveState();
renderReminders();
renderCalendar();
})
);
}
function renderWords() {
$("#vocabList").innerHTML = state.words
.map(
(item) =>
`<article class="word-card"><div><strong>${item.word}</strong><p>${ item.meaning }</p><div class="word-meta">${item.pron || "No pronunciation"} · ${ item.example }</div></div><button class="delete-btn" data-action="deleteWord" data-id="${ item.id }" type="button">×</button></article>`
)
.join("");
$$('[data-action="deleteWord"]').forEach((button) =>
button.addEventListener("click", () => {
state.words = state.words.filter((item) => item.id !== button.dataset.id);
playerIndex = 0;
saveState();
renderWords();
renderPlayer();
renderReview();
makeHiddenWord();
})
);
}


function makeHiddenWord() {
if (!state.words.length) {
$("#hiddenSentence").textContent =
"Chưa có từ vựng.";
return;
}

const item =
state.words[
Math.floor(Math.random() * state.words.length)
];

hiddenWord = item.word;

$("#hiddenSentence").innerHTML =
item.example.replace(
new RegExp(item.word, "i"),
"<mark>_____</mark>"
);
}




function renderParagraph() {
const words = state.words.slice(0, 3);
$(
"#paragraphOutput"
).textContent = `I want to improve my English routine this week. I will learn the word ${ words[0]?.word || "environment" }, use it in a sentence, and review it before the deadline. This small habit can make my writing clearer and more natural.`;
}

function renderPlayer() {
  if (!state.words.length) {
    $("#flipInner").innerHTML = "<p>Chưa có từ vựng nào.</p>";
    return;
  }

  const item = state.words[playerIndex];

  $("#flipInner").innerHTML = `
    <div class="flip-front">
      <h2>${item.word}</h2>
      <p>${item.pron || ""}</p>
      <p>${item.example}</p>
    </div>

    <div class="flip-back">
      <p><strong>${item.meaning}</strong></p>
      <p>${item.pron || ""}</p>
      <p>${item.example}</p>
    </div>
  `;
}

function flipCard() {
  $("#playerCard").classList.toggle("flipped");
  playFlipSound();
}

$("#playerCard").addEventListener("click", flipCard);

function speakCurrentWord() {

const item = state.words[playerIndex];

if (!item?.word) return;

const speech = new SpeechSynthesisUtterance(item.word);

speech.lang = "en-US";
speech.rate = 1;

speech.onstart = () => {
$("#playPodcast")?.classList.add("active");
$("#audioBars")?.classList.add("playing");
};

speech.onend = () => {
$("#playPodcast")?.classList.remove("active");
$("#audioBars")?.classList.remove("playing");
};

speech.onerror = () => {
$("#playPodcast")?.classList.remove("active");
$("#audioBars")?.classList.remove("playing");
};

window.speechSynthesis.cancel();
window.speechSynthesis.speak(speech);
}

function detectVocabulary() {
  const text = $("#importText").value;

  if (!text.trim()) {
    alert("Vui lòng dán danh sách từ vựng.");
    return;
  }

  const lines = text.split(/\r?\n/);

  const importedWords = [];

  lines.forEach((line) => {
    line = line.trim();
    if (!line) return;

    // bỏ ghi chú trong ngoặc
    line = line.replace(/\(.*?\)/g, "").trim();

    /**
     * HỖ TRỢ NHIỀU FORMAT:
     * 1. photo zone (n) /pron/ meaning
     * 2. photo zone /pron/ meaning
     * 3. photo zone /pron/ meaning extra text
     */

    const match = line.match(/^(.+?)\s+\/(.+?)\/\s+(.+)$/);

    if (!match) return;

    let word = match[1].trim();
    const pron = match[2].trim();
    const meaning = match[3].trim();

    // ❌ loại bỏ part of speech trong word: (n), (v), (adj)
    word = word.replace(/\b(n|v|adj|adv|noun|verb|adjective|adverb)\b/gi, "").trim();

    // ❌ tránh duplicate
    const existed = findVocabularyMatch(word);

    if (existed) return;

    importedWords.push({
      id: crypto.randomUUID(),
      word,
      pron: `/${pron}/`,
      meaning,
      topic: "General",
      example: "",
      added: dateKey(new Date()),
    });
  });

  if (importedWords.length === 0) {
    $("#detectOutput").innerHTML =
      "Có thể bạn đã có từ này rồi. Nếu chưa có hãy kiểm tra format (word /pron/ meaning)";
    return;
  }

  state.words.unshift(...importedWords);

  saveState();
  renderWords();
  renderPlayer();
  renderReview();

  $("#detectOutput").innerHTML =
    `Đã nhập ${importedWords.length} từ vựng thành công.`;
}

function makeIdea(topic) {
const idea = {
Family:
"Main idea: Family teaches patience. Outline: daily support, shared responsibilities, one memory. Sample: My family helps me become calmer when I face pressure.",
School:
"Main idea: School builds discipline. Outline: subjects, friends, goals. Sample: A good school day gives me both knowledge and motivation.",
Friend:
"Main idea: A true friend listens honestly. Outline: trust, help, respect. Sample: Friendship becomes stronger when both people share and improve together.",
Travel:
"Main idea: Travel opens the mind. Outline: place, culture, lesson. Sample: Visiting a new city can teach us more than a book sometimes.",
Technology:
"Main idea: Technology supports learning. Outline: tools, risks, balance. Sample: Smart tools are useful when students use them with clear goals.",
Sports:
"Main idea: Sports train the body and mind. Outline: health, teamwork, confidence. Sample: Playing sports after school helps me reduce stress.",
Environment:
"Main idea: Protecting the environment starts with habits. Outline: plastic, trees, transport. Sample: Small daily actions can create a cleaner community.",
Health:
"Main idea: Health is a study advantage. Outline: sleep, food, exercise. Sample: When I sleep well, I can focus better in class.",
}[topic];
$("#ideaOutput").textContent = idea;
}

function analyzeText(text) {
  const issues = [];
  if (!text || typeof text !== "string") return issues;

  const cleanText = text.trim();
  const words = cleanText.match(/\b[a-zA-Z']+\b/g) || [];
  const lowerText = cleanText.toLowerCase();

  const addIssue = (issue) => {
    issues.push(issue);
  };

  /* =========================
     1. SPELLING CHECK (SAFE)
  ========================== */
  for (const [wrong, right] of Object.entries(corrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, "i");

    if (regex.test(lowerText)) {
      addIssue({
        type: "spelling",
        message: `"${wrong}" should be "${right}"`,
        suggestion: right,
        severity: "high"
      });
    }
  }

  /* =========================
     2. GRAMMAR RULES (SAFE FIX)
  ========================== */
  for (const rule of grammarRules) {
    const match = cleanText.match(rule.pattern);
    if (!match) continue;

    let fix = rule.fix;

    if (typeof fix === "function") {
      fix = fix(match[0]);
    }

    addIssue({
      type: rule.type,
      message: rule.explain,
      suggestion: fix,
      severity: rule.type === "grammar" ? "high" : "medium"
    });
  }

  /* =========================
     3. SENTENCE END CHECK
  ========================== */
  const lastChar = cleanText.slice(-1);
  if (cleanText.length > 10 && !/[.!?]/.test(lastChar)) {
    addIssue({
      type: "punctuation",
      message: "Sentence has no ending punctuation",
      suggestion: "Add . or ! or ?",
      severity: "low"
    });
  }

  /* =========================
     4. REAL REPETITION CHECK (FIXED)
  ========================== */
  const freq = {};

  words.forEach(w => {
    const word = w.toLowerCase();
    freq[word] = (freq[word] || 0) + 1;
  });

  Object.entries(freq).forEach(([word, count]) => {
    if (count >= 4) {
      addIssue({
        type: "repetition",
        message: `"${word}" is repeated ${count} times`,
        suggestion: "Use synonyms instead",
        severity: "medium"
      });
    }
  });

  return issues;
}

function checkWriting() {
  const text =
    $("#writingInput").value.trim() ||
    "I want to improve my enviroment because writting English is important.";

  const issues = analyzeText(text);

  // =========================
  // 1. AUTO VOCAB (LUÔN CHẠY)
  // =========================
  const newWords = extractNewVocabulary(text);

  if (newWords.length > 0) {
    const added = [];

    newWords.forEach(w => {
      state.words.unshift({
        id: crypto.randomUUID(),
        word: w,
        meaning: "auto-added (need update)",
        pron: "",
        example: "",
        added: dateKey(new Date())
      });
      added.push(w);
    });

    saveState();
    renderWords();
    renderPlayer();
    renderReview();

    // thông báo nhẹ, KHÔNG phá UI grammar
    $("#checkerOutput").innerHTML =
      `<div class="ok-text">📚 Added ${added.length} new words: ${added.join(", ")}</div>`;
  }

  // =========================
  // 2. GRAMMAR RESULT UI
  // =========================
  if (!issues.length) {
    $("#checkerOutput").innerHTML +=
      `<p class='ok-text'>🔥 Perfect writing! No issues detected.</p>`;
    return;
  }

  const color = (type) => ({
    spelling: "#ff4d4d",
    grammar: "#ff9800",
    punctuation: "#2196f3",
    repetition: "#9c27b0",
    style: "#00c853"
  }[type] || "#ccc");

  $("#checkerOutput").innerHTML += issues
    .sort((a, b) => (b.severity === "high") - (a.severity === "high"))
    .map(i => `
      <div class="error-box" style="border-left:4px solid ${color(i.type)}">
        <p>
          <strong>${i.type.toUpperCase()}</strong>
        </p>
        <p>${i.message}</p>
        <small>👉 Suggestion: <b>${i.suggestion}</b></small>
      </div>
    `)
    .join("");
}

function hasVocabulary(text) {
  const lowerText = text.toLowerCase();

  return state.words.some(vocab =>
    lowerText.includes(vocab.word.toLowerCase())
  );
}

function extractNewVocabulary(text) {
  if (!text || typeof text !== "string") return [];

  // chuẩn hoá từ
  const words = text
    .toLowerCase()
    .match(/\b[a-z]{3,}\b/g) || [];

  // bỏ từ đã có trong kho
  const existing = new Set(state.words.map(w => w.word.toLowerCase()));

  const stopWords = new Set([
    "the", "and", "is", "are", "was", "were",
    "this", "that", "with", "for", "you", "your",
    "have", "has", "had", "not", "but", "can",
    "will", "from", "they", "them", "then"
  ]);

  const newWords = [];

  words.forEach(w => {
    if (stopWords.has(w)) return;
    if (existing.has(w)) return;

    if (!newWords.includes(w)) {
      newWords.push(w);
    }
  });

  return newWords;
}

function suggestRewrite(text) {
  let result = text;

  for (const rule of grammarRules) {
    if (rule.pattern.test(result)) {
      result = result.replace(rule.pattern, rule.fix);
    }
  }

  return result;
}

function renderReview() {
$("#reviewGrid").innerHTML = reviewDays
.map((day) => {
const words = state.words
.filter(
(_, index) => index % reviewDays.length === reviewDays.indexOf(day)
)
.slice(0, 3);
return `<article class="review-card"><strong>Day ${day}</strong>${ words.map((word) => `<span>${word.word}</span>`).join("") || "<span>No words</span>" }</article>`;
})
.join("");
}
function updateStats() {
const done = Object.values(state.planner)
.flat()
.filter((item) => item.done).length;
$("#tasksDone").textContent = done;
$("#wordsCount").textContent = state.words.length;
$("#studyHours").textContent = `${state.progress .reduce((sum, value) => sum + value, 0) .toFixed(1)}h`;
}
function drawProgress() {
const canvas = $("#progressChart");
if (!canvas) return;
const ctx = canvas.getContext("2d"),
w = canvas.width,
h = canvas.height;
ctx.clearRect(0, 0, w, h);
const accent = getComputedStyle(document.body)
.getPropertyValue("--accent")
.trim(),
accent2 = getComputedStyle(document.body)
.getPropertyValue("--accent-2")
.trim();
const max = Math.max(...state.progress, 5),
gap = 18,
barW = (w - gap * 8) / 7,
labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
ctx.fillStyle = "rgba(255,255,255,.08)";
ctx.fillRect(0, 0, w, h);
state.progress.forEach((value, index) => {
const x = gap + index * (barW + gap),
barH = (h - 70) * (value / max),
y = h - 42 - barH;
const gradient = ctx.createLinearGradient(0, y, 0, h);
gradient.addColorStop(0, accent);
gradient.addColorStop(1, accent2);
ctx.fillStyle = gradient;
roundRect(ctx, x, y, barW, barH, 8);
ctx.fill();
ctx.fillStyle = "rgba(243,247,251,.85)";
ctx.font = "16px Segoe UI";
ctx.textAlign = "center";
ctx.fillText(`${value}h`, x + barW / 2, y - 10);
ctx.fillStyle = "rgba(174,184,199,.95)";
ctx.font = "14px Segoe UI";
ctx.fillText(labels[index], x + barW / 2, h - 16);
});
}
function roundRect(ctx, x, y, w, h, r) {
ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.arcTo(x + w, y, x + w, y + h, r);
ctx.arcTo(x + w, y + h, x, y + h, r);
ctx.arcTo(x, y + h, x, y, r);
ctx.arcTo(x, y, x + w, y, r);
ctx.closePath();
}
function autoEyeProtection() {
const hour = new Date().getHours();
if (hour >= 21 || hour < 6) {
document.body.classList.add("eye-mode");
$("#eyeMode").checked = true;
}
}
async function searchWord() {

const word =
$("#dictionarySearch")
.value
.trim()
.toLowerCase();

if (!word) return;

try {

const response = await fetch(
`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
);

if (!response.ok) {
$("#dictionaryResult").innerHTML = "Không tìm thấy từ.";
return;
}

const data = await response.json();

if (!Array.isArray(data) || !data.length) {
  $("#dictionaryResult").innerHTML = "Không tìm thấy từ.";
  return;
}

const item = data[0];


currentAudioUrl =
item.phonetics?.find(p => p.audio)?.audio || "";

const partOfSpeech =
item.meanings?.[0]?.partOfSpeech ||
"unknown";

const phonetic =
item.phonetic ||
item.phonetics?.[0]?.text ||
"Không có";
const englishMeaning =
item.meanings?.[0]?.definitions?.[0]?.definition ||
"Không có nghĩa";

let vietnameseMeaning = "Không dịch được";

try {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(item.word)}&langpair=en|vi`
  );

  const data = await res.json();

  vietnameseMeaning =
    data?.responseData?.translatedText?.trim() ||
    "Không dịch được";

} catch (err) {
  console.log("Translate error:", err);
}

const existed = findVocabularyMatch(word);

if (!existed) {

state.words.unshift({
id: crypto.randomUUID(),
word: item.word,
meaning: vietnameseMeaning,
pron: phonetic,
example: englishMeaning,
topic: "General",
added: dateKey(new Date())
});

saveState();
renderWords();
}

// Trong hàm xử lý dictionaryResult
$("#dictionaryResult").innerHTML = `
<div class="word-header">
<h3 id="dictWordTitle">${item.word}</h3>

<div class="audio-box">
<span class="ipa">${phonetic}</span>

<button id="speakDictWord" class="icon-btn-audio">
🔊
</button>
</div>
</div>

<div id="dictBars" class="audio-bars">
<span></span><span></span><span></span><span></span>
</div>

<div class="word-body">
<p><strong>Loại từ:</strong> ${partOfSpeech}</p>
<p><strong>Nghĩa tiếng Anh:</strong> ${englishMeaning}</p>
<p><strong>Nghĩa tiếng Việt:</strong> ${vietnameseMeaning}</p>
</div>
`;

bindDictionaryAudio(item.word);



// GẮN SỰ KIỆN NGAY SAU ĐÓ
const audioBtn = document.getElementById("playDictAudio");
if (audioBtn) {
audioBtn.addEventListener("click", function() {
this.classList.add("active");
const utterance = new SpeechSynthesisUtterance(item.word);
window.speechSynthesis.speak(utterance);
setTimeout(() => this.classList.remove("active"), 1000);
});
}



} catch (error) {

console.log(error);

$("#dictionaryResult").innerHTML =
"Lỗi kết nối API.";
}
}
async function translateToVietnamese(text) {

try {

const response = await fetch(
`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`
);

const data = await response.json();

return data.responseData.translatedText;

} catch {

return "Không dịch được";
}
}

function findVocabularyMatch(input) {
  const query = input.toLowerCase().trim();

  // match đúng từ trước
  let exact = state.words.find(
    w => w.word.toLowerCase() === query
  );

  if (exact) return exact;

  // match phrase (cụm từ chứa vocab)
  let phrase = state.words.find(
    w => query.includes(w.word.toLowerCase())
  );

  if (phrase) return phrase;

  return null;
}

function playFlipSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const bufferSize = 0.1 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.2;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = 0.2;

  noise.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + 0.08);
}

init();