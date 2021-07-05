import { showPage } from "./util.js";

const teamsButton = document.getElementById("teams");
const jsContent = document.getElementById("jsContent");
const baseUrl = window.location.origin;
const activeUser = document.getElementById("activeUsername").innerText;

teamsButton.addEventListener("click", () => {
  fetchUserTeams();
});

function renderTeamsHtml(data) {
  return `<ul class="list-group">
    ${Object.entries(data.groups)
      .map(
        ([key, value]) => `
    <li data-id="${value.id}" style="cursor: pointer" class="mb-0 list-group-item dynamic-content d-flex justify-content-between align-items-center">
    ${key}<span class="badge badge-primary badge-pill">Members: ${value.users}</span>
    </li>`
      )
      .join(" ")}
    </ul>`;
}

export function fetchUserTeams() {
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

function renderTeamPageHtml(data) {}

function fetchTeamPage(id) {
  fetch(`/api/teams/${id}/?format=json`)
    .then((response) => response.json())
    .then((data) => (jsContent.innerHTML = renderTeamPageHtml(data)))
    .then(showPage("jsContent"))
    .then(
      history.pushState(
        { section: baseUrl + `/team/${id}` },
        null,
        baseUrl + `/team/${id}`
      )
    )
    .catch((err) => console.log(err));
}
