import {
  showPage,
  createPagination,
  activatePaginationLinks,
  submitForm,
} from "./util.js";

const alerts = document.getElementById("alerts");
const unread = document.getElementById("alert-counter");

fetchAlerts();

// nav bar alerts
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
    .then(
      setTimeout(() => {
        activateAlertsClickEvent();
        activateInviteButtons();
      }, 1500)
    )
    .catch((err) => console.log(err));
}

function activateInviteButtons() {
  const inviteButtons = document.getElementsByName("accept_invite");
  const declineButtons = document.getElementsByName("decline_invite");

  if (inviteButtons.length) {
    inviteButtons.forEach((button) =>
      button.addEventListener("click", (e) => {
        const team = e.target.dataset.title;
        const invitedUser = e.target.dataset.user;
        const alertId = e.target.parentElement.dataset.id;
        const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];

        const formData = new FormData();
        formData.append("invited_user", invitedUser);
        formData.append("invite_to_team", team);
        formData.append("alert_id", alertId);

        submitForm(csrf, formData);

        const alertModal = document.getElementById(`navAlert${alertId}`);
        const navAlert = document.getElementById(`navbarAlert${alertId}`);
        const cancelButton = document.getElementById(`obj-cancel-${alertId}`);

        // close modal and remove alert from dom
        cancelButton.click();
        alertModal.remove();
        navAlert.remove();
      })
    );
    declineButtons.forEach((button) =>
      button.addEventListener("click", (e) => {
        const alertId = e.target.parentElement.dataset.id;
        const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];

        const formData = new FormData();
        formData.append("declined_alert_id", alertId);

        submitForm(csrf, formData);

        const alertModal = document.getElementById(`navAlert${alertId}`);
        const navAlert = document.getElementById(`navbarAlert${alertId}`);
        const cancelButton = document.getElementById(`obj-cancel-${alertId}`);

        // close modal and remove alert from dom
        cancelButton.click();
        alertModal.remove();
        navAlert.remove();
      })
    );
  }
}

function populateNavAlert(html) {
  alerts.innerHTML = html;
}

function createHtmlAlert(obj) {
  // convert date to readable format
  const time = new Date(obj.timestamp).toDateString();

  //check if already read for styling
  if (obj.read == false) {
    unread.innerHTML++;
    unread.innerHTML == 10 ? (unread.innerHTML = "10+") : "";
  }

  const container = document.getElementById("alertModals");
  container.innerHTML += `<div id="navAlert${obj.id}" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content" >
      <div class="modal-header">
          <h5 class="modal-title">
          Alert</h5>
          <button class="close" type="button" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
          </button>
      </div>
      <div class="modal-body" id="obj-content-${obj.id}">
      <p data-id="${obj.id}">${obj.content}</p>
        <p class="mb-0 text-right"><small>${time}</small></p>
      </div>
      <div class="modal-footer">
          <button class="btn btn-secondary btn-cancel" id="obj-cancel-${obj.id}" type="button" data-dismiss="modal">Cancel</button>
      </div>
    </div>
  </div>
</div>`;

  //create element
  return `
        <a id="navbarAlert${obj.id}" data-id="${
    obj.id
  }" data-toggle="modal" data-target="#navAlert${
    obj.id
  }" class="dropdown-item d-flex align-items-center alert-item alert-list-item ${
    obj.read ? "" : "font-weight-bold"
  }">
        <div class="mr-3 ${obj.read ? "" : "font-weight-bold"}" data-id="${
    obj.id
  }">
            <div data-id="${obj.id}" class="icon-circle ${
    obj.read ? "bg-info" : "bg-warning font-weight-bold"
  }">
                <i class="fas ${
                  obj.read ? "fa-file-alt" : "fa-exclamation"
                } text-white"></i>
            </div>
        </div>
        <div data-id="${obj.id}" class="${obj.read ? "" : "font-weight-bold"}">
            <div data-id="${obj.id}" class="small text-gray-500 ${
    obj.read === false ? "font-weight-bold" : ""
  }">${time}</div>
            <span data-id="${obj.id}" class="${
    obj.read === false ? "font-weight-bold" : ""
  }" id="alert-content-${obj.id}">${obj.content}</span>
        </div>
      </a>
      `;
}

const createHtmlAlertPage = (alert) => {
  const time = new Date(alert.timestamp).toDateString();
  return `
  <a data-toggle="modal" data-target="#alert${alert.id}" id="alert-${
    alert.id
  }" data-id="${
    alert.id
  }" class="dynamic-content list-group-item list-group-item-action alert-list-item ${
    alert.read ? "" : "list-group-item-primary"
  }"> ${alert.content.slice(0, 20)}...<br>
   <small><i>${time}</i></small>
   </a>
  <div id="alert${
    alert.id
  }" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content" >
      <div class="modal-header">
          <h5 class="modal-title">
          Alert</h5>
          <button class="close" type="button" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
          </button>
      </div>
      <div class="modal-body" id="alert-content-${alert.id}">
      <p>${alert.content}</p>
        <p class="mb-0 text-right"><small>${time}</small></p>
      </div>
      <div class="modal-footer">
          <button class="btn btn-secondary btn-cancel" id="alert-cancel-${
            alert.id
          }" type="button" data-dismiss="modal">close</button>
      </div>
    </div>
  </div>
</div>
`;
};

export function fetchAlertsPage(pageNumber) {
  // alert page heading
  const heading = `<div class="dynamic-content container-fluid">
<h1 id="alertsHeading" class="h1 text-gray-800 my-5">Alerts</h1></div>`;

  // render heading and containers
  jsContent.innerHTML =
    heading +
    `<ul id="alert-list" class="list-group">
</ul>`;

  const alertList = document.getElementById("alert-list");

  fetch(`/api/alerts/?format=json${pageNumber ? "&page=" + pageNumber : ""}`)
    .then((response) => response.json())
    .then((data) =>
      data
        ? [
            data.results.map((alert) => createHtmlAlertPage(alert)),
            createPagination(data.count),
          ]
        : (jsContent.innerHTML = "No Alerts...")
    )
    .then((html) =>
      html !== "No Alerts..."
        ? (alertList.innerHTML = html[0].join("") + html[1])
        : ""
    )
    .then(
      setTimeout(() => {
        activatePaginationLinks();
        activateAlertsClickEvent();
      }, 1500)
    )
    .catch((err) => console.log(err));
}

function activateAlertsClickEvent() {
  const alerts = document.getElementsByClassName("alert-list-item");
  // for each alert, update read to true
  [...alerts].forEach((alert) => [
    alert.removeEventListener("click", alertClick),
    alert.addEventListener("click", alertClick),
  ]);
}

function alertClick(e) {
  const id = e.target.dataset.id;
  const baseUrl = window.location.origin;
  const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];

  const navContent = document.getElementById(`alert-content-${id}`);
  const li = document.getElementById(`alert-${id}`);
  // if unread alert, send request to make read and remove unread styles
  if (
    e.target.classList.contains("list-group-item-primary") ||
    e.target.classList.contains("font-weight-bold")
  ) {
    fetch(`${baseUrl}/api/alerts/${id}/`, {
      method: "PATCH",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-CSRFToken": csrf.value,
      },
      // mark read as true
      body: JSON.stringify({ read: true }),
    })
      // remove unread styles
      .then(li ? li.classList.remove("list-group-item-primary") : "")
      .then(
        navContent
          ? [
              navContent.classList.remove("font-weight-bold"),
              navContent.classList.add("font-weight-normal"),
            ]
          : ""
      )
      // adjust unread counter in nav
      .then(() => [
        unread.innerHTML--,
        unread.innerHTML < 1 ? (unread.style.display = "none") : "",
      ])
      .catch((err) => console.log(err));
  }
}

// more messages page
document.getElementById("alertPage").addEventListener("click", () => {
  const baseUrl = window.location.origin;
  fetchAlertsPage();
  showPage("jsContent");

  history.pushState(
    { section: baseUrl + "/alerts" },
    null,
    baseUrl + "/alerts"
  );
});
