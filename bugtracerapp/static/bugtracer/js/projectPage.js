document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("jsContent");

  const fetchProjects = fetch("/api/projects/?format=json")
    .then((response) => response.json())
    .then((data) =>
      data
        ? data.results.map((message) => createHtmlMessage(message))
        : (messages.innerHTML = "No Messages...")
    )
    .then((html) =>
      html !== "No Messages..." ? (messages.innerHTML = html.join("")) : ""
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
});
