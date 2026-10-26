const IN_PROGRESS_LIMIT = 3;
const columns = [
  { status: "todo", title: "To do" },
  { status: "progress", title: "In progress" },
  { status: "done", title: "Done" }
];
const tasks = [
  { id: 1, title: "Practice JavaScript conditions", priority: 3, important: true, tags: ["JavaScript"], status: "todo" },
  { id: 2, title: "Write functions for a game", priority: 2, important: false, tags: ["JavaScript"], status: "todo" },
  { id: 3, title: "Create elements with the DOM", priority: 3, important: true, tags: ["JavaScript"], status: "progress" },
  { id: 4, title: "Check the ticket form", priority: 3, important: true, tags: ["JavaScript", "HTML"], status: "progress" },
  { id: 5, title: "Test the mobile layout", priority: 2, important: false, tags: ["CSS"], status: "progress" },
  { id: 6, title: "Add accessible form labels", priority: 2, important: false, tags: ["HTML"], status: "todo" },
  { id: 7, title: "Prepare assignment screenshots", priority: 1, important: false, tags: ["Study"], status: "todo" },
  { id: 8, title: "Review code for the defense", priority: 3, important: true, tags: ["Study"], status: "todo" },
  { id: 9, title: "Build page navigation", priority: 1, important: false, tags: ["HTML"], status: "done" },
  { id: 10, title: "Choose fonts and spacing", priority: 1, important: false, tags: ["CSS"], status: "done" }
];
const priorities = { 1: "Low", 2: "Medium", 3: "High" };
const app = document.getElementById("boardApp");

// The HTML starts with one empty container. Controls are created only once.
const controls = document.createElement("div");
controls.className = "controls panel";
app.append(controls);

function addSelect(id, labelText, options) {
  const field = document.createElement("div");
  field.className = "field";
  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = labelText;
  const select = document.createElement("select");
  select.id = id;
  for (const item of options) {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.text;
    select.append(option);
  }
  field.append(label, select);
  controls.append(field);
  return select;
}

const tagOptions = [{ value: "all", text: "All tags" }];
for (const task of tasks) {
  for (const tag of task.tags) {
    if (!tagOptions.some(option => option.value === tag)) {
      tagOptions.push({ value: tag, text: tag });
    }
  }
}
const tagFilter = addSelect("tagFilter", "Filter by tag", tagOptions);
const prioritySort = addSelect("prioritySort", "Sort by priority", [
  { value: "high", text: "High to low" },
  { value: "low", text: "Low to high" }
]);
const searchField = document.createElement("div");
searchField.className = "field";
const searchLabel = document.createElement("label");
searchLabel.htmlFor = "taskSearch";
searchLabel.textContent = "Search tasks";
const search = document.createElement("input");
search.id = "taskSearch";
search.type = "search";
search.placeholder = "Search by title";
searchField.append(searchLabel, search);
controls.append(searchField);

const progressRow = document.createElement("div");
progressRow.className = "progress-row panel";
const progressText = document.createElement("label");
progressText.htmlFor = "boardProgress";
const progress = document.createElement("progress");
progress.id = "boardProgress";
progressRow.append(progressText, progress);
const message = document.createElement("p");
message.id = "boardMessage";
message.className = "message";
message.setAttribute("role", "status");
message.setAttribute("aria-live", "polite");
const board = document.createElement("div");
board.id = "boardCards";
board.className = "board";
app.append(progressRow, message, board);

function showMessage(text, type) {
  message.textContent = text;
  message.className = "message";
  if (type) message.classList.add(type);
}

function render() {
  board.replaceChildren();
  let finished = 0;
  let inProgress = 0;
  for (const task of tasks) {
    if (task.status === "done") finished++;
    if (task.status === "progress") inProgress++;
  }
  const percent = tasks.length === 0 ? 0 : Math.round(finished / tasks.length * 100);
  progress.max = tasks.length || 1;
  progress.value = finished;
  progressText.textContent = `${finished} of ${tasks.length} tasks finished (${percent}%)`;

  const query = search.value.trim().toLowerCase();
  const visible = tasks.filter(task =>
    (tagFilter.value === "all" || task.tags.includes(tagFilter.value)) &&
    task.title.toLowerCase().includes(query)
  );
  visible.sort((a, b) => prioritySort.value === "high"
    ? b.priority - a.priority : a.priority - b.priority);

  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty panel";
    empty.textContent = "No tasks found. Change the tag or search text.";
    board.append(empty);
    return;
  }

  for (const column of columns) {
    const section = document.createElement("section");
    section.className = "column";
    const heading = document.createElement("h2");
    heading.textContent = column.title;
    if (column.status === "progress") {
      heading.textContent += ` (${inProgress}/${IN_PROGRESS_LIMIT})`;
    }
    section.append(heading);
    let cardCount = 0;
    for (const task of visible) {
      if (task.status !== column.status) continue;
      cardCount++;
      const card = document.createElement("article");
      card.className = "card";
      card.id = `task-${task.id}`;
      card.tabIndex = -1;
      const title = document.createElement("h3");
      title.textContent = task.title;
      const details = document.createElement("p");
      details.className = "muted";
      details.textContent = `${task.tags.join(", ")} | ${priorities[task.priority]} priority`;
      if (task.important) details.textContent += " | Important";
      const actions = document.createElement("div");
      actions.className = "card-actions";
      for (const destination of columns) {
        if (destination.status === task.status) continue;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `Move to ${destination.title}`;
        button.dataset.id = task.id;
        button.dataset.status = destination.status;
        button.setAttribute("aria-label", `${task.title}: move to ${destination.title}`);
        actions.append(button);
      }
      card.append(title, details, actions);
      section.append(card);
    }
    if (cardCount === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No matching tasks in this column.";
      section.append(empty);
    }
    board.append(section);
  }
}

// One delegated listener handles every card button, including after rendering.
app.addEventListener("click", event => {
  const button = event.target.closest("button[data-id]");
  if (!button || !app.contains(button)) return;
  const task = tasks.find(item => item.id === Number(button.dataset.id));
  const destination = columns.find(item => item.status === button.dataset.status);
  if (!task || !destination || task.status === destination.status) return;
  let inProgress = 0;
  for (const item of tasks) {
    if (item.status === "progress") inProgress++;
  }
  if (destination.status === "progress" && inProgress >= IN_PROGRESS_LIMIT) {
    showMessage(`Cannot move this task: In progress already has ${IN_PROGRESS_LIMIT} cards. Move one out first.`, "error");
    return;
  }
  task.status = destination.status;
  render();
  showMessage(`Moved "${task.title}" to ${destination.title}.`, "success");
  document.getElementById(`task-${task.id}`).focus();
});

tagFilter.addEventListener("change", () => { showMessage(""); render(); });
prioritySort.addEventListener("change", () => { showMessage(""); render(); });
search.addEventListener("input", () => { showMessage(""); render(); });
render();
