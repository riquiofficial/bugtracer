const alerts = document.getElementById("alerts");
const unread = document.getElementById("alert-counter");

fetchAlerts();

function fetchAlerts() {
  fetch(`/api/alerts/?format=json`)
    .then((response) => response.json())
    .then((data) =>
      data
        ? data.results.map((alert) => createHtmlAlert(alert))
        : (alerts.innerHTML = "No Alerts...")
    )
    .then((html) =>
      html !== "No Alerts..." ? populateNavAlert(html.slice(0, 5).join("")) : ""
    )
    .then(() => addAlertClickEvent())
    .catch((err) => console.log(err));
}

function populateNavAlert(html) {
  alerts.innerHTML = html;
}

function addAlertClickEvent() {
  const alerts = document.getElementsByClassName("alert-item");
  [...alerts].forEach((alert) =>
    alert.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const baseUrl = window.location.origin;
      const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];
      const content = document.getElementById(`alert-content-${id}`);

      fetch(`${baseUrl}/api/alerts/${id}/?format=json`)
        .then((response) => response.json())
        .then((result) => console.log(result))
        .then(
          fetch(`${baseUrl}/api/alerts/${id}/`, {
            method: "PUT",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
              "X-CSRFToken": csrf.value,
            },
            // mark read as true
            body: JSON.stringify({ content: content.innerHTML, read: true }),
          })
            .catch((err) => console.log(err))
            // update unread counter and bold text as read
            .then(() => [
              unread.innerHTML--,
              unread.innerHTML < 1 ? (unread.style.display = "none") : "",
              content.classList.remove("font-weight-bold"),
            ])
        );
    })
  );
}

function createHtmlAlert(obj) {
  // convert date to readable format
  const time = new Date(obj.timestamp).toDateString();

  //check if already read for styling
  if (obj.read == false) {
    unread.innerHTML++;
  }

  //create element
  return `
        <a data-id="${
          obj.id
        }" class="dropdown-item d-flex align-items-center alert-item">
        <div class="mr-3">
            <div data-id="${obj.id}" class="icon-circle ${
    obj.read ? "bg-info" : "bg-warning"
  }">
                <i class="fas ${
                  obj.read ? "fa-file-alt" : "fa-exclamation"
                } text-white"></i>
            </div>
        </div>
        <div>
            <div data-id="${obj.id}" class="small text-gray-500">${time}</div>
            <span data-id="${obj.id}" class="${
    obj.read === false ? "font-weight-bold" : ""
  }" id="alert-content-${obj.id}">${obj.content}</span>
        </div>
      </a>
      `;
}
