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
    ${data.groups.map(
      (group) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
    ${group}<span class="badge badge-primary badge-pill">14</span>
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
        { section: baseUrl + "/myTeams/" },
        null,
        baseUrl + "/myTeams/"
      )
    )
    .then(console.log("successfully fetched"))
    .catch((err) => console.log(err));
}
