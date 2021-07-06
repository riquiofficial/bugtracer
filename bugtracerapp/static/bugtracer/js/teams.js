import { showPage } from "./util.js";

const teamsButton = document.getElementById("teams");
const jsContent = document.getElementById("jsContent");
const baseUrl = window.location.origin;
const activeUser = document.getElementById("activeUsername").innerText;
const submitTeamForm = document.getElementById("submitTeamForm");

teamsButton.addEventListener("click", () => {
  fetchUserTeams();
});

function renderTeamsHtml(data) {
  return `<button class="btn btn-primary m-3 dynamic-content" id="newTeam">New Team</button><ul class="list-group">
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
    .then(
      setTimeout(() => {
        activateTeamEventListeners(), activateNewTeamButton();
      }, 1500)
    )
    .catch((err) => console.log(err));
}

function activateNewTeamButton() {
  const newTeamButton = document.getElementById("newTeam");
  newTeamButton.addEventListener("click", () => {
    showPage("teamForm");
    history.pushState(
      { section: baseUrl + `/newTeam` },
      null,
      baseUrl + `/newTeam`
    );
  });
}

function renderTeamPageHtml(data) {
  console.log(data);
  return `<h1 class="dynamic-content ml-2 mb-4">${data.name}</h1>
    <ul class="list-group">${data.users
      .map(
        (user) =>
          `<a href="${baseUrl}/profile/${user}"><li class="dynamic-content list-group-item">${user}</li></a>`
      )
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
