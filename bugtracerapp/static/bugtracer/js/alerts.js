import { showPage, createPagination, activatePaginationLinks } from "./util.js";

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
        .then(
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
    unread.innerHTML == 10 ? (unread.innerHTML = "10+") : "";
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

const createHtmlAlertPage = (alert) => {
  const time = new Date(alert.timestamp).toDateString();
  return `
  <a data-toggle="modal" data-target="#alert${alert.id}" id="alert-${
    alert.id
  }" data-id="${
    alert.id
  }" class="list-group-item list-group-item-action alert-list-item ${
    alert.read ? "" : "list-group-item-primary"
  }"> From <strong><img class="rounded-circle" style="width: 30px; height: 30px; margin: 5px"
  src="${
    alert.sender.profile_picture
      ? alert.sender.profile_picture
      : "/media/profile-pics/undraw_profile.svg"
  }" alt="${alert.sender.username}'s profile picture"
  /><span>${alert.sender.username}</span></strong>: ${alert.content.slice(
    0,
    20
  )}...<br>
   <small><i>${time}</i></small>
   </a>
  <div id="alert${
    alert.id
  }" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content" >
      <div class="modal-header">
      ${
        alert.sender.profile_picture
          ? `<img class="mr-4 rounded-circle" style="width: 40px; height: 40px"
      src="${
        alert.sender.profile_picture
          ? alert.sender.profile_picture
          : "/media/profile-pics/undraw_profile.svg"
      }" alt="${alert.sender.username} profile picture"
      />`
          : ""
      }
          <h5 class="modal-title">
          ${alert.sender.username}</h5>
          <button class="close" type="button" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
          </button>
      </div>
      <div class="modal-body" id="alert-content-${alert.id}">
      <p>${alert.content}</p>
      <p class="mb-1"><small>recipients:</p> 
      <ul style="list-style: none">
      ${alert.receiver
        .map(
          (receiver) => `<li style="padding: 3px"><img src="${
            receiver.profile_picture
              ? receiver.profile_picture
              : "/media/profile-pics/undraw_profile.svg"
          }" 
      width="40px" height="40px" class="rounded-circle" alt="${
        receiver.username
      }'s profile picture">
      ${receiver.username}</li>`
        )
        .join("")} 
        </ul></small>
        <p class="mb-0 text-right"><small>Sent: ${time}</small></p>
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
  const heading = `<div class="container-fluid">
<h1 id="messagesHeading" class="h1 text-gray-800 my-5">Alerts</h1></div>`;

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
