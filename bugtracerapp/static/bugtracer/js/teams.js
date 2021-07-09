import { showPage, submitForm } from "./util.js";

const teamsButton = document.getElementById("teams");
const jsContent = document.getElementById("jsContent");
const baseUrl = window.location.origin;
const activeUser = document.getElementById("activeUsername").innerText;
const submitTeamForm = document.getElementById("submitTeamForm");

teamsButton.addEventListener("click", () => {
  fetchUserTeams();
});

submitTeamForm.addEventListener("click", createNewTeam);

function createNewTeam() {
  const groupName = document.getElementById("group_name").value;
  const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];

  let teamFormFields = new FormData();
  teamFormFields.append("group_name", groupName);
  submitForm(csrf, teamFormFields);
}

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
  return `<h1 class="dynamic-content ml-2 mb-4" id="team_name">${data.name}</h1>
      <button class="dynamic-content m-2 btn btn-success" id="invite_user_button">Invite</button>
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

function activateInviteEventListener() {
  const invite = document.getElementById("invite_user_button");
  invite.addEventListener("click", () => renderInvitePage());
}

function renderInvitePage() {
  const teamName = document.getElementById("team_name").innerText;
  jsContent.innerHTML = `
  <div class="mx-3 dynamic-content">
  <h3 class="mb-4">Invite User to ${teamName}</h3>
  <p>Please enter a username:</p>
  <input class="form-control mb-2" id="invite_user" />
  <button class="btn btn-primary mb-2" id="invite_user_button">Invite</button>
  </div>
  `;
  activateUserInviteButton(teamName);
}

function activateUserInviteButton(teamName) {
  const inviteButton = document.getElementById("invite_user_button");
  const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];

  inviteButton.addEventListener("click", () => {
    const username = document.getElementById("invite_user").value;

    let inviteUserForm = new FormData();
    inviteUserForm.append("username", username);
    inviteUserForm.append("invite_group_name", teamName);

    submitForm(csrf, inviteUserForm);
  });
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
    .then(() => activateInviteEventListener())
    .catch((err) => console.log(err));
}
