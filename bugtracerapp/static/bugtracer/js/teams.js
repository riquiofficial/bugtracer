import { showPage } from "./util.js";

const teamsButton = document.getElementById("teams");
const jsContent = document.getElementById("jsContent");
const baseUrl = window.location.origin;
const activeUser = document.getElementById("activeUsername").innerText;

teamsButton.addEventListener("click", () => {
  fetchTeams();
});

function renderTeamsHtml(data) {
  return `<ul class="list-group">
    ${Object.entries(data.groups).map(
      ([key, value]) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
    ${key}<span class="badge badge-primary badge-pill">Members: ${value}</span>
    </li>`
    )}
    </ul>`;
}

export function fetchTeams() {
  fetch(`/api/profile/${activeUser}/?format=json`)
    .then((response) => response.json())
    .then((data) => (jsContent.innerHTML = renderTeamsHtml(data)))
    .then(showPage("jsContent"))
    .then(
      history.pushState(
        { section: baseUrl + "/myTeams" },
        null,
        baseUrl + "/myTeams"
      )
    )
    .catch((err) => console.log(err));
}
