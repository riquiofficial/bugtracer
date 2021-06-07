import { showPage } from "./util.js";

const messages = document.getElementById("messages");
const unread = document.getElementById("message-counter");
const jsContent = document.getElementById("jsContent");

const fetchMessages = fetch("/api/messages/?format=json")
  .then((response) => response.json())
  .then((data) =>
    data
      ? data.results.map((message) => createHtmlMessage(message))
      : (messages.innerHTML = "No Messages...")
  )
  .then((html) =>
    html !== "No Messages..."
      ? messagePage
        ? (jsContent.innerHTML = html.join(""))
        : (messages.innerHTML = html.slice(0, 5).join(""))
      : ""
  )
  .catch((err) => console.log(err));

function createHtmlMessage(obj) {
  const time = new Date(obj.timestamp).toDateString();
  if (obj.read == false) {
    unread.innerHTML = Number(unread.innerHTML) + 1;
  }
  return `
      <a class="dropdown-item d-flex align-items-center" href="#">
      <div class="dropdown-list-image mr-3">
          <img class="rounded-circle" src="${
            obj.sender.profile_picture
              ? obj.sender.profile_picture
              : "/media/profile-pics/undraw_profile.svg"
          }"
              alt="">
          <div class="status-indicator bg-success"></div>
      </div>
      <div class="font-weight-bold">
          <div class="text-truncate">${obj.content}</div>
          <div class="small text-gray-500">${
            obj.sender.username
          } · ${time}</div>
      </div>
  </a>
        `;
}

document.getElementById("messagePage").addEventListener("click", () => {
  const baseUrl = window.location.origin;

  showPage("jsContent");

  history.pushState(
    { section: baseUrl + "/messages" },
    null,
    baseUrl + "/messages"
  );
});
