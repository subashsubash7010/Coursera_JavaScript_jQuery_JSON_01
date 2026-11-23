const STORAGE_KEY = "wa4e-automobiles";

function readVehicles() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function writeVehicles(vehicles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMessage(text, isError = false) {
  const message = document.querySelector("#message");
  if (!message) return;
  message.textContent = text;
  message.classList.toggle("error", isError);
  message.hidden = false;
}

function formatMileage(mileage) {
  return new Intl.NumberFormat("en-US").format(Number(mileage));
}

function getVehicleId() {
  return new URLSearchParams(window.location.search).get("id");
}

function initList() {
  const table = document.querySelector("#vehicle-table");
  if (!table) return;

  const vehicles = readVehicles();
  const emptyState = document.querySelector("#empty-state");
  emptyState.hidden = vehicles.length !== 0;

  table.innerHTML = vehicles.map((vehicle) => `
    <tr>
      <td>${escapeHtml(vehicle.make)}</td>
      <td>${escapeHtml(vehicle.model)}</td>
      <td>${escapeHtml(vehicle.year)}</td>
      <td>${formatMileage(vehicle.mileage)}</td>
      <td>
        <div class="actions">
          <a class="button small" href="edit.html?id=${encodeURIComponent(vehicle.id)}">Edit</a>
          <a class="button small link-danger" href="delete.html?id=${encodeURIComponent(vehicle.id)}">Delete</a>
        </div>
      </td>
    </tr>
  `).join("");

  const notice = new URLSearchParams(window.location.search).get("notice");
  if (notice) showMessage(notice);
}

function initForm() {
  const form = document.querySelector("#vehicle-form");
  if (!form) return;

  const isEditPage = window.location.pathname.endsWith("edit.html");
  const id = getVehicleId();

  if (isEditPage) {
    const vehicle = readVehicles().find((item) => item.id === id);
    if (!vehicle) {
      showMessage("This automobile could not be found.", true);
      form.hidden = true;
      return;
    }
    form.elements.make.value = vehicle.make;
    form.elements.model.value = vehicle.model;
    form.elements.year.value = vehicle.year;
    form.elements.mileage.value = vehicle.mileage;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = {
      make: form.elements.make.value.trim(),
      model: form.elements.model.value.trim(),
      year: Number(form.elements.year.value),
      mileage: Number(form.elements.mileage.value)
    };

    if (!values.make || !values.model) {
      showMessage("Make and model are required.", true);
      return;
    }

    const vehicles = readVehicles();
    if (isEditPage) {
      const index = vehicles.findIndex((item) => item.id === id);
      if (index === -1) {
        showMessage("This automobile could not be found.", true);
        return;
      }
      vehicles[index] = { ...vehicles[index], ...values };
      writeVehicles(vehicles);
      window.location.href = "index.html?notice=Vehicle updated successfully";
    } else {
      vehicles.push({ id: crypto.randomUUID(), ...values });
      writeVehicles(vehicles);
      window.location.href = "index.html?notice=Vehicle added successfully";
    }
  });
}

function initDelete() {
  const button = document.querySelector("#confirm-delete");
  if (!button) return;

  const id = getVehicleId();
  const vehicles = readVehicles();
  const vehicle = vehicles.find((item) => item.id === id);

  if (!vehicle) {
    showMessage("This automobile could not be found.", true);
    button.disabled = true;
    return;
  }

  const copy = document.querySelector("#delete-copy");
  copy.textContent = `Are you sure you want to delete ${vehicle.year} ${vehicle.make} ${vehicle.model}?`;

  button.addEventListener("click", () => {
    writeVehicles(vehicles.filter((item) => item.id !== id));
    window.location.href = "index.html?notice=Vehicle deleted successfully";
  });
}

initList();
initForm();
initDelete();
