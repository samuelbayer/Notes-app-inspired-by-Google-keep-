let createNoteBtn = document.getElementById("create-note-button");
let createNoteFormBtn = document.getElementById("create-note-form-button");
let notesSection = document.getElementById("notes");
let notes = JSON.parse(localStorage.getItem("data")) || [];
let notePopup = document.getElementById("create-note-popup");
let closeNotePopupBtn = document.getElementById("close-note-form-btn");
let overlay = document.querySelector(".overlay");
let titleInput = document.getElementById("title");
let descriptionInput = document.getElementById("description");
let notesBtn = document.getElementById("note-btn");
let binBtn = document.getElementById("bin-btn");
const notesNumber = document.getElementById("notes-number");
const deletedNumber = document.getElementById("deleted-number");
const fullNotePopup = document.getElementById("full-note-popup");
const searcherInput = document.getElementById("searcher-input");
let currentFilter = "notes";
let currentNote = {};
const fullNote = document.getElementById("full-note");

function removeSpecialChars(value) {
  return value.trim().replace(/[^A-Za-z0-9\-\s]/g, "");
}

function addOrUpdateNote() {
  if (!titleInput.value.trim()) {
    alert("Please provide a title");
    return;
  }
  const dataArrIndex = notes.findIndex((item) => item.id === currentNote.id);
  let noteObj = {
    id: `${removeSpecialChars(titleInput.value)
      .toLowerCase()
      .split(" ")
      .join("-")}-${Date.now()}`,
    title: titleInput.value,
    date: Date.now(),
    description: descriptionInput.value,
    deleted: false,
    deletedAt: Date.now(),
  };

  if (dataArrIndex === -1) {
    notes.unshift(noteObj);
  } else {
    notes[dataArrIndex] = noteObj;
  }
  localStorage.setItem("data", JSON.stringify(notes));
  updateNoteContainer(notes);
  reset();
}

function escapeHTML(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateNoteContainer(notes) {
  const ActiveNotes = notes.filter((note) => !note.deleted);
  const TrashedNotes = notes.filter((note) => note.deleted);
  const filteredNotes =
    currentFilter === "notes"
      ? ActiveNotes
      : currentFilter === "trash"
      ? TrashedNotes
      : notes;

  notesNumber.innerText = ActiveNotes.length;
  deletedNumber.innerText = TrashedNotes.length;
  notesSection.innerHTML = "";
  filteredNotes.forEach(({ id, title, description, deleted }) => {
    const shortDesc =
      description.length > 200
        ? description.slice(0, description.lastIndexOf(" ", 200)) + "..."
        : description;

    const html = `
      <div class="note ${
        deleted ? "note-deleted" : ""
      }" id="${id}" role="listitem">
        <p class="title">${escapeHTML(title)}</p>
        <p class="description">${escapeHTML(shortDesc)}</p>
      </div>
    `;

    notesSection.insertAdjacentHTML("beforeend", html);
  });
}

function deleteNote(buttonEl) {
  const noteId = buttonEl.closest("footer").previousElementSibling.id;
  const dataArrIndex = notes.findIndex((item) => item.id === noteId);
  console.log(dataArrIndex);
  if (notes[dataArrIndex].deleted) {
    buttonEl.parentElement.remove();
    notes.splice(dataArrIndex, 1);
    localStorage.setItem("data", JSON.stringify(notes));
  } else {
    notes[dataArrIndex].deleted = true;
    notes[dataArrIndex].deletedAt = Date.now();
    localStorage.setItem("data", JSON.stringify(notes));
  }
  fullNotePopup.classList.add("hidden");
  updateNoteContainer(notes);
}

function reset() {
  titleInput.value = "";
  descriptionInput.value = "";
  currentNote = {};
}

function editNote(buttonEl) {
  const dataArrIndex = notes.findIndex(
    (note) => note.id === buttonEl.parentElement.id
  );
  currentNote = notes[dataArrIndex];
  titleInput.value = currentNote.title;
  descriptionInput.value = currentNote.description;
  createNoteFormBtn.innerText = "Update note";
  openPopup();
}

function openPopup() {
  overlay.classList.remove("hidden");
}

function closePopup() {
  overlay.classList.add("hidden");
}

function bigNote(note) {
  const fecha = new Date(note.date);
  fullNotePopup.classList.toggle("hidden");
  if (!note.deleted) {
    fullNote.innerHTML = ` <div id="${note.id}">
      <p class="title">${note.title}</p>
      <p class="description">${note.description}</p>
      </div>
      <footer class="footer">
      <div>
      <p>Created: ${fecha.toLocaleDateString()}</p>
      </div>
      <div>
      <button onClick="editNote(this)" class="btn">Edit</button>
      <button onClick="deleteNote(this)" class="btn">Delete</button>
      </div>
      </footer>
    `;
  } else {
    fullNote.innerHTML = ` <div id="${note.id}">
      <p class="title">${note.title}</p>
      <p class="description">${note.description}</p>
      </div>
      <footer class="footer">
      <p>It will be deleted in: ${note.deletedAt}</p>
      <button onClick="restoreNote(this)" class="btn">Restore</button>
      <button onClick="deleteNote(this)" class="btn">Delete</button>
      </footer>
    `;
  }
}

function restoreNote(buttonEl) {
  const noteId = buttonEl.closest("footer").previousElementSibling.id;
  const dataArrIndex = notes.findIndex((item) => item.id === noteId);
  notes[dataArrIndex].deleted = false;
  localStorage.setItem("data", JSON.stringify(notes));
  fullNotePopup.classList.add("hidden");
  updateNoteContainer(notes);
}

function sevenDaysRemoveNote() {
  const ahora = new Date();
  const sieteDias = 7 * 24 * 60 * 60 * 1000;
  notes = notes.filter(
    (note) => !(note.deleted && ahora - note.deletedAt >= sieteDias)
  );
  localStorage.setItem("data", JSON.stringify(notes));
}

function searcher() {
  const query = searcherInput.value.trim().toLowerCase();
  if (query.length > 1) {
    let filteredNotes = notes;
    filteredNotes = filteredNotes.filter((note) =>
      note.title.toLowerCase().includes(query)
    );
    updateNoteContainer(filteredNotes);
  } else {
    updateNoteContainer(notes);
  }
}

closeNotePopupBtn.addEventListener("click", () => {
  closePopup();
  reset();
  updateNoteContainer(notes);
});
createNoteBtn.addEventListener("click", openPopup);

createNoteFormBtn.addEventListener("click", () => {
  addOrUpdateNote();
  closePopup();
});

notesBtn.addEventListener("click", () => {
  currentFilter = "notes";
  updateNoteContainer(notes);
});

binBtn.addEventListener("click", () => {
  currentFilter = "trash";
  updateNoteContainer(notes);
});

notesSection.addEventListener("click", (e) => {
  const noteEl = e.target.closest(".note");
  if (!noteEl) return;
  const id = noteEl.id;
  const note = notes.find((n) => n.id === id);
  bigNote(note);
});

fullNotePopup.addEventListener("click", () => {
  fullNotePopup.classList.add("hidden");
});

fullNote.addEventListener("click", (e) => {
  e.stopPropagation();
});

let timeoutId;
searcherInput.addEventListener("input", () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    searcher();
  }, 300);
});

sevenDaysRemoveNote();
updateNoteContainer(notes);
