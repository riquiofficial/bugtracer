import {
  showPage,
  createPagination,
  activatePaginationLinks,
  submitForm,
  activateContributorProfiles,
} from "./util.js";

const messages = document.getElementById("messages");
const unread = document.getElementById("message-counter");
const jsContent = document.getElementById("jsContent");
const baseUrl = window.location.origin;

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
        activateReplyButtons();
        activateContributorProfiles();
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
  container.innerHTML += `<div id="message${
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
          <h5 class="modal-title contributor" id="senderUsername${
            message.id
          }" data-id="${message.id}" data-username="${message.sender.username}">
          ${message.sender.username}</h5>
          <button class="close" type="button" data-data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
          </button>
      </div>
      <div class="modal-body" id="message-content-${message.id}">
      <p>${message.content}</p>
      <p class="mb-1"><small>recipients:</p> 
      <ul style="list-style: none">
      ${message.receiver
        .map(
          (receiver) => `<a><li class="contributor" data-id="${
            message.id
          }" data-username="${
            receiver.username
          }" style="padding: 3px"><img data-id="${message.id}" data-username="${
            receiver.username
          }" src="${
            receiver.profile_picture
              ? receiver.profile_picture
              : "/media/profile-pics/undraw_profile.svg"
          }" 
      width="40px" height="40px" class="rounded-circle" alt="${
        receiver.username
      }'s profile picture">
      ${receiver.username}</li></a>`
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
      <a data-id="${message.id}" data-toggle="modal" data-target="#message${
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
  } text-truncate" id="messageContent${message.id}" >${message.content}</div>
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
  <a data-toggle="modal" data-target="#message${message.id}" data-id="${
    message.id
  }" id="message-${
    message.id
  }" class="dynamic-content list-group-item list-group-item-action message-list-item ${
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
   ${
     !document.getElementById(`message${message.id}`)
       ? `<div id="message${
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
          <h5 class="modal-title" id="senderUsername${message.id}">${
           message.sender.username
         }</h5>
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
</div>`
       : ""
   }
  
`;
};

export function fetchMessagesPage(pageNumber) {
  // messages page

  const heading = `<div class="dynamic-content container-fluid">
<h1 id="messagesHeading" class="h1 text-gray-800 my-5">Messages
<div class="text-right">
<div id="newMessageButton" class="btn btn-primary">New Message</div>
</div></h1>
</div>
`;

  // render heading and containers
  jsContent.innerHTML =
    heading +
    `<ul id="message-list" class="list-group">
</ul>`;

  // new message page
  const newMessageButton = document.getElementById("newMessageButton");
  newMessageButton.addEventListener("click", () => {
    showPage("messagePage");

    history.pushState(
      { section: baseUrl + "/newMessage" },
      null,
      baseUrl + "/newMessage"
    );

    const sendButton = document.getElementById("submitMessageForm");
    // ensure event does not duplicate when page re-opened
    sendButton.removeEventListener("click", sendMessage);
    sendButton.addEventListener("click", sendMessage);
  });

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
        activateReplyButtons();
      }, 1500)
    )
    .catch((err) => console.log(err));
}

export function sendMessage() {
  console.log("clicked");
  const messageCsrf = document.getElementsByName("csrfmiddlewaretoken")[2];
  const content = document.getElementById("messageContent");

  // create array of each checked value of receiver input
  const receiverSelected = document.querySelectorAll(
    "#id_receiver option:checked"
  );

  const receiverValues = Array.from(receiverSelected).map((el) => el.value);

  let messageFormFields = new FormData();
  messageFormFields.append("content", content.value);
  messageFormFields.append("receiver", receiverValues);

  submitForm(messageCsrf, messageFormFields);
}

function activateReplyButtons() {
  const replyButtons = document.getElementsByClassName("replyMessageButton");

  [...replyButtons].forEach((button) => {
    button.removeEventListener("click", replyButtonEvent);
    button.addEventListener("click", replyButtonEvent);
  });
}

function replyButtonEvent(e) {
  const id = e.target.dataset.id;
  const content = document.getElementById(`message-content-${id}`);
  const reset = String(content.innerHTML);

  content.innerHTML = `<div><p>Reply to sender</p><textarea id="new-message-content-${id}"></textarea><br />
    <button class="btn btn-secondary" id="cancel-reply-button-${id}">Cancel</button>
    <button class="btn btn-primary" id="reply-button-${id}">Reply</button></div>`;

  const sendReplyButton = document.getElementById(`reply-button-${id}`);
  const cancelButton = document.getElementById(`cancel-reply-button-${id}`);

  sendReplyButton.addEventListener("click", () => {
    const content = document.getElementById(`new-message-content-${id}`);
    let receiver = Array(
      document.getElementById(`senderUsername${id}`).innerText
    );

    let formData = new FormData();
    formData.append("content", content.value);
    formData.append("receiver", receiver);

    const csrf = document.getElementsByName("csrfmiddlewaretoken")[2];

    submitForm(csrf, formData);

    content.innerHTML = reset;
  });
  cancelButton.addEventListener("click", () => (content.innerHTML = reset));
}

function activateMessagesClickEvent() {
  const messages = document.getElementsByClassName("message-list-item");
  // for each message, update read to true
  [...messages].forEach((message) => [
    message.removeEventListener("click", messageClick),
    message.addEventListener("click", messageClick),
  ]);
}

function messageClick(e) {
  console.log("clicked");
  const id = e.target.dataset.id;
  const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];

  const navContent = document.getElementById(`messageContent${id}`);
  const li = document.getElementById(`message-${id}`);

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
      // remove unread styles
      .then(li ? li.classList.remove("list-group-item-primary") : "")
      .then(navContent ? navContent.classList.remove("font-weight-bold") : "")
      // adjust unread counter in nav
      .then(() => [
        unread.innerHTML--,
        unread.innerHTML < 1 ? (unread.style.display = "none") : "",
      ])
      .catch((err) => console.log(err));
  }
}

// more messages page
document.getElementById("messagePage").addEventListener("click", () => {
  fetchMessagesPage();
  showPage("jsContent");

  history.pushState(
    { section: baseUrl + "/messages" },
    null,
    baseUrl + "/messages"
  );
});
