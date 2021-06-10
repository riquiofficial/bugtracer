import { showPage, createPagination, activatePaginationLinks } from "./util.js";

const messages = document.getElementById("messages");
const unread = document.getElementById("message-counter");
const jsContent = document.getElementById("jsContent");

// nav bar messages
export function fetchMessages() {
  fetch("/api/messages/?format=json")
    .then((response) => response.json())
    .then((data) =>
      data
        ? data.results.map((message) => createHtmlMessage(message))
        : (messages.innerHTML = "No Messages...")
    )
    .then((html) =>
      html !== "No Messages..."
        ? (messages.innerHTML = html.slice(0, 5).join(""))
        : ""
    )
    .then(
      setTimeout(() => {
        activateMessagesClickEvent();
      }, 1500)
    )
    .catch((err) => console.log(err));
}
fetchMessages();

// nav bar messages
function createHtmlMessage(message) {
  const time = new Date(message.timestamp).toDateString();
  if (message.read == false) {
    unread.innerHTML = Number(unread.innerHTML) + 1;
    // if 10 or more unread, render "10+"
    unread.innerHTML == 10 ? (unread.innerHTML = "10+") : "";
  }

  const container = document.getElementById("messageModals");
  container.innerHTML += `<div id="navmessage${
    message.id
  }" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content" >
      <div class="modal-header">
      ${
        message.sender.profile_picture
          ? `<img class="mr-4 rounded-circle" style="width: 40px; height: 40px"
      src="${
        message.sender.profile_picture
          ? message.sender.profile_picture
          : "/media/profile-pics/undraw_profile.svg"
      }" alt="${message.sender.username} profile picture"
      />`
          : ""
      }
          <h5 class="modal-title">
          ${message.sender.username}</h5>
          <button class="close" type="button" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
          </button>
      </div>
      <div class="modal-body" id="message-content-${message.id}">
      <p>${message.content}</p>
      <p class="mb-1"><small>recipients:</p> 
      <ul style="list-style: none">
      ${message.receiver
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
          <button class="btn btn-secondary btn-cancel" id="message-cancel-${
            message.id
          }" type="button" data-dismiss="modal">Cancel</button>
          <a class="btn btn-info replyMessageButton" data-id="${
            message.id
          }" id="reply-${message.id}">Reply</a>
      </div>
    </div>
  </div>
</div>`;

  return `
      <a data-id="${message.id}" data-toggle="modal" data-target="#navmessage${
    message.id
  }" class="${
    message.read ? "" : "font-weight-bold"
  } message-list-item dropdown-item d-flex align-items-center">
      <div data-id="${message.id}" class="dropdown-list-image mr-3">
          <img data-id="${message.id}" class="rounded-circle" src="${
    message.sender.profile_picture
      ? message.sender.profile_picture
      : "/media/profile-pics/undraw_profile.svg"
  }"
              alt="">
          <div class="status-indicator bg-success"></div>
      </div>
      <div>
          <div data-id="${message.id}" class="${
    message.read ? "" : "font-weight-bold"
  } text-truncate">${message.content}</div>
          <div data-id="${message.id}" class="${
    message.read ? "" : "font-weight-bold"
  } small text-gray-500">${message.sender.username} · ${time}</div>
      </div>
  </a>
        `;
}

const createHtmlMessagePage = (message) => {
  const time = new Date(message.timestamp).toDateString();
  return `
  <a data-toggle="modal" data-target="#message${message.id}" id="message-${
    message.id
  }" data-id="${
    message.id
  }" class="list-group-item list-group-item-action message-list-item ${
    message.read ? "" : "list-group-item-primary"
  }"> From <strong><img class="rounded-circle" style="width: 30px; height: 30px; margin: 5px"
  src="${
    message.sender.profile_picture
      ? message.sender.profile_picture
      : "/media/profile-pics/undraw_profile.svg"
  }" alt="${message.sender.username}'s profile picture"
  /><span>${message.sender.username}</span></strong>: ${message.content.slice(
    0,
    20
  )}...<br>
   <small><i>${time}</i></small>
   </a>
  <div id="message${
    message.id
  }" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content" >
      <div class="modal-header">
      ${
        message.sender.profile_picture
          ? `<img class="mr-4 rounded-circle" style="width: 40px; height: 40px"
      src="${
        message.sender.profile_picture
          ? message.sender.profile_picture
          : "/media/profile-pics/undraw_profile.svg"
      }" alt="${message.sender.username} profile picture"
      />`
          : ""
      }
          <h5 class="modal-title">
          ${message.sender.username}</h5>
          <button class="close" type="button" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
          </button>
      </div>
      <div class="modal-body" id="message-content-${message.id}">
      <p>${message.content}</p>
      <p class="mb-1"><small>recipients:</p> 
      <ul style="list-style: none">
      ${message.receiver
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
            message.id
          }" type="button" data-dismiss="modal">Cancel</button>
          <a class="btn btn-info replyMessageButton" data-id="${
            message.id
          }" id="reply-${message.id}">Reply</a>
      </div>
    </div>
  </div>
</div>
`;
};

export function fetchMessagesPage(pageNumber) {
  // messages page

  const heading = `<div class="container-fluid">
<h1 id="messagesHeading" class="h1 text-gray-800 my-5">Messages</h1></div>`;

  // render heading and containers
  jsContent.innerHTML =
    heading +
    `<ul id="message-list" class="list-group">
</ul>`;

  const messageList = document.getElementById("message-list");
  fetch(`/api/messages/?format=json${pageNumber ? "&page=" + pageNumber : ""}`)
    .then((response) => response.json())
    .then((data) =>
      data
        ? [
            data.results.map((message) => createHtmlMessagePage(message)),
            createPagination(data.count),
          ]
        : (jsContent.innerHTML = "No Messages...")
    )
    .then((html) =>
      html !== "No Messages..."
        ? (messageList.innerHTML = html[0].join("") + html[1])
        : ""
    )
    .then(
      setTimeout(() => {
        activatePaginationLinks();
        activateMessagesClickEvent();
      }, 1500)
    )
    .catch((err) => console.log(err));
}

function activateMessagesClickEvent() {
  const messages = document.getElementsByClassName("message-list-item");
  // for each message, update read to true
  [...messages].forEach((message) =>
    message.addEventListener("click", (e) => {
      console.log(e.target.classList);
      const id = e.target.dataset.id;
      const baseUrl = window.location.origin;
      const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];

      // if unread message, send request to make read and remove unread styles
      if (
        e.target.classList.contains("list-group-item-primary") ||
        e.target.classList.contains("font-weight-bold")
      ) {
        fetch(`${baseUrl}/api/messages/${id}/`, {
          method: "PATCH",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "X-CSRFToken": csrf.value,
          },
          // mark read as true
          body: JSON.stringify({ read: true }),
        })
          .then(e.target.classList.remove("list-group-item-primary"))
          .then(e.target.classList.remove("font-weight-bold"))
          .then(() => [
            unread.innerHTML--,
            unread.innerHTML < 1 ? (unread.style.display = "none") : "",
          ])
          .catch((err) => console.log(err));
      }
    })
  );
}

// more messages page
document.getElementById("messagePage").addEventListener("click", () => {
  const baseUrl = window.location.origin;
  fetchMessagesPage();
  showPage("jsContent");

  history.pushState(
    { section: baseUrl + "/messages" },
    null,
    baseUrl + "/messages"
  );
});
