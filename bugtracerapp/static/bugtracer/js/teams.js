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
    <li data-id="${value.id}" style="cursor: pointer" class="team-item mb-0 list-group-item dynamic-content d-flex justify-content-between align-items-center">
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
    .then(setTimeout(() => activateTeamEventListeners(), 1500))
    .catch((err) => console.log(err));
}

function renderTeamPageHtml(data) {
  console.log(data);
  return `<h1 class="dynamic-content">${data.name}</h1>
    <ul>${data.users
      .map((user) => `<li class="dynamic-content">${user}</li>`)
      .join("")}
      </ul>
  `;
}

function activateTeamEventListeners() {
  const teams = document.getElementsByClassName("team-item");
  [...teams].forEach((team) =>
    team.addEventListener("click", (e) => fetchTeamPage(e.target.dataset.id))
  );
}

export function fetchTeamPage(id) {
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
