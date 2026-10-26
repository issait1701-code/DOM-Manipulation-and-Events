// Each row is one ticket type for one event date.
const ticketTypes = [
  { eventId: "web", date: "2026-11-03", type: "standard", price: 2000, seats: 6 },
  { eventId: "web", date: "2026-11-03", type: "vip", price: 3500, seats: 2 },
  { eventId: "web", date: "2026-11-04", type: "standard", price: 2000, seats: 0 },
  { eventId: "web", date: "2026-11-04", type: "vip", price: 3500, seats: 0 },
  { eventId: "game", date: "2026-11-05", type: "standard", price: 3000, seats: 4 },
  { eventId: "game", date: "2026-11-05", type: "vip", price: 4500, seats: 0 },
  { eventId: "game", date: "2026-11-06", type: "standard", price: 3000, seats: 5 },
  { eventId: "game", date: "2026-11-06", type: "vip", price: 4500, seats: 1 }
];
const promoCodes = [
  { code: "STUDENT10", discount: 10 },
  { code: "AITU20", discount: 20 }
];
const form = document.getElementById("ticket-form");
const fieldIds = ["event", "date", "ticketType", "quantity", "fullName", "email", "promoCode"];
const fields = fieldIds.map(id => document.getElementById(id));
const eventField = document.getElementById("event");
const dateField = document.getElementById("date");
const typeField = document.getElementById("ticketType");
const quantityField = document.getElementById("quantity");
const nameField = document.getElementById("fullName");
const emailField = document.getElementById("email");
const promoField = document.getElementById("promoCode");
const summary = document.getElementById("error-summary");
const preview = document.getElementById("ticket-preview");
const result = document.getElementById("ticket-result");
let touched = {};
let submitted = false;

form.noValidate = true;

function getTicketType() {
  return ticketTypes.find(item => item.eventId === eventField.value &&
    item.date === dateField.value && item.type === typeField.value);
}

function getPromo() {
  return promoCodes.find(item => item.code === promoField.value.trim().toUpperCase());
}

function getError(field) {
  field.setCustomValidity("");
  if (field.validity.valueMissing) return "This field is required.";
  if (field.validity.typeMismatch) return "Enter a valid email address.";
  if (field.validity.badInput) return "Enter a number.";
  if (field.validity.rangeUnderflow || field.validity.stepMismatch) {
    return "Enter a whole number of at least 1.";
  }
  if (field.id === "fullName" && field.value.trim().length < 2) {
    return "Enter a name with at least 2 non-space characters.";
  }
  if (field.id === "date" && eventField.value !== "") {
    const rows = ticketTypes.filter(item => item.eventId === eventField.value && item.date === field.value);
    if (rows.length === 0) return "This event is not available on that date.";
    if (rows.every(item => item.seats === 0)) return "This date is sold out. Choose another date.";
  }
  const ticket = getTicketType();
  const hasSession = ticketTypes.some(item => item.eventId === eventField.value && item.date === dateField.value);
  if (field.id === "ticketType" && hasSession && !ticket) {
    return "This ticket type is not offered for the selected date.";
  }
  if (field.id === "ticketType" && ticket && ticket.seats === 0) {
    return "This ticket type is sold out for the selected date.";
  }
  if (field.id === "quantity") {
    const amount = Number(field.value);
    if (!Number.isInteger(amount) || amount < 1) return "Enter a whole number of at least 1.";
    if (ticket && ticket.seats > 0 && amount > ticket.seats) {
      return "Only " + ticket.seats + " seats are left for this ticket type.";
    }
  }
  if (field.id === "promoCode" && field.value.trim() !== "" && !getPromo()) {
    return "Unknown code. Use STUDENT10 or AITU20, or leave it empty.";
  }
  if (!field.checkValidity()) return "Check this value and try again.";
  return "";
}

function validateField(field) {
  const message = getError(field);
  field.setCustomValidity(message);
  field.setAttribute("aria-invalid", String(message !== ""));
  field.classList.toggle("invalid", message !== "");
  document.getElementById(field.id + "-error").textContent = message;
  return message;
}

function refreshValidation() {
  let errorCount = 0;
  for (const field of fields) {
    if (touched[field.id] && validateField(field) !== "") errorCount++;
  }
  if (submitted) {
    summary.hidden = errorCount === 0;
    summary.textContent = errorCount + " field(s) need attention. Correct the errors below.";
  }
}

function addLine(container, label, value) {
  const paragraph = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = label + ": ";
  paragraph.append(strong, document.createTextNode(String(value)));
  container.append(paragraph);
}

function getTotal() {
  const ticket = getTicketType();
  const promo = getPromo();
  const quantity = Number(quantityField.value);
  const subtotal = ticket && quantity > 0 ? ticket.price * quantity : 0;
  return Math.round(subtotal * (100 - (promo ? promo.discount : 0)) / 100);
}

function money(amount) {
  return amount.toLocaleString("en-US") + " KZT";
}

function renderPreview() {
  const ticket = getTicketType();
  const promo = getPromo();
  const sessions = [];
  for (const item of ticketTypes) {
    if (item.eventId === eventField.value && !sessions.includes(item.date)) sessions.push(item.date);
  }
  document.getElementById("date-help").textContent = sessions.length > 0
    ? "Session dates: " + sessions.join(", ") + "." : "Choose an event to see its session dates.";
  document.getElementById("type-help").textContent = ticket
    ? ticket.seats + " seats left; " + money(ticket.price) + " each." : "Choose an event and a session date.";
  preview.replaceChildren();
  addLine(preview, "Event", eventField.value ? eventField.selectedOptions[0].textContent : "Not selected");
  addLine(preview, "Date", dateField.value || "Not selected");
  addLine(preview, "Type", typeField.selectedOptions[0].textContent);
  addLine(preview, "Quantity", quantityField.value || "Not entered");
  addLine(preview, "Name", nameField.value.trim() || "Not entered");
  addLine(preview, "Email", emailField.value.trim() || "Not entered");
  addLine(preview, "Seats left", ticket ? ticket.seats : "Choose a session");
  addLine(preview, "Promo code", promoField.value.trim() || "None");
  addLine(preview, "Discount", promo ? promo.discount + "%" : "0%");
  addLine(preview, "Total", money(getTotal()));
}

function handleInput() {
  // Changing an event or date can also change a touched quantity/type error.
  refreshValidation();
  renderPreview();
}

for (const field of fields) {
  field.addEventListener("blur", () => {
    touched[field.id] = true;
    refreshValidation();
  });
}
form.addEventListener("input", handleInput);
form.addEventListener("change", handleInput);

form.addEventListener("submit", event => {
  event.preventDefault();
  submitted = true;
  let firstInvalid = null;
  for (const field of fields) {
    touched[field.id] = true;
    if (validateField(field) !== "" && firstInvalid === null) firstInvalid = field;
  }
  refreshValidation();
  if (firstInvalid !== null) {
    firstInvalid.focus();
    return;
  }

  const ticket = getTicketType();
  const bookingCode = "AITU-" + (Math.floor(Math.random() * 900000) + 100000);
  result.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = "Booking confirmed";
  result.append(heading);
  addLine(result, "Booking code", bookingCode);
  addLine(result, "Event", eventField.selectedOptions[0].textContent);
  addLine(result, "Date", dateField.value);
  addLine(result, "Ticket type", typeField.selectedOptions[0].textContent);
  addLine(result, "Quantity", quantityField.value);
  addLine(result, "Name", nameField.value.trim());
  addLine(result, "Email", emailField.value.trim());
  addLine(result, "Total", money(getTotal()));
  ticket.seats -= Number(quantityField.value);
  result.hidden = false;

  form.reset();
  touched = {};
  submitted = false;
  summary.hidden = true;
  summary.textContent = "";
  for (const field of fields) {
    field.setCustomValidity("");
    field.setAttribute("aria-invalid", "false");
    field.classList.remove("invalid");
    document.getElementById(field.id + "-error").textContent = "";
  }
  renderPreview();
  result.focus();
});

renderPreview();
