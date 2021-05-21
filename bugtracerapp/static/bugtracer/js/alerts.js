document.addEventListener("DOMContentLoaded", () => {
  const alerts = document.getElementById("alerts");
  const unread = document.getElementById("alert-counter");

  const fetchAlerts = fetch("/api/alerts/?format=json")
    .then((response) => response.json())
    .then((data) =>
      data
        ? data.results.map((alert) => createHtmlAlert(alert))
        : (alerts.innerHTML = "No Alerts...")
    )
    .then((html) =>
      html !== "No Alerts..." ? (alerts.innerHTML = html.join("")) : ""
    )
    .catch((err) => console.log(err));

  function createHtmlAlert(obj) {
    // convert date to readable format
    const time = new Date(obj.timestamp).toDateString();

    //check if already read for styling
    if (obj.read == false) {
      unread.innerHTML = Number(unread.innerHTML) + 1;
    }

    //create element
    return `
        <a class="dropdown-item d-flex align-items-center" href="#">
        <div class="mr-3">
            <div class="icon-circle ${obj.read ? "bg-info" : "bg-warning"}">
                <i class="fas ${
                  obj.read ? "fa-file-alt" : "fa-exclamation"
                } text-white"></i>
            </div>
        </div>
        <div>
            <div class="small text-gray-500">${time}</div>
            <span class="${obj.read === false ? "font-weight-bold" : ""}">${
      obj.content
    }</span>
        </div>
      </a>
      `;
  }
});
