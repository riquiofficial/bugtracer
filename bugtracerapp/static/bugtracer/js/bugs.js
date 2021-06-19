import {
  showPage,
  closeNavBarMenu,
  submitForm,
  createPagination,
  activatePaginationLinks,
  formatDate,
  activateContributorProfiles,
} from "./util.js";

const baseUrl = window.location.origin;
const jsContent = document.getElementById("jsContent");

// nav menu items
const activeBugs = document.getElementById("activeBugs");
const solved = document.getElementById("solved");

// generate heading for active bug or solved bug page
const heading = (solvedBugsPage = false) => {
  return `<div class="container-fluid">
      <h1 id="bugHeading" class="dynamic-content h1 text-gray-800 my-5">${
        solvedBugsPage ? "Solved" : "Active"
      } Bugs</h1>
    </div>`;
};

// bug registration page

document.getElementById("registerBug").addEventListener("click", () => {
  showPage("registerBug");
  closeNavBarMenu();
  history.pushState(
    { section: baseUrl + "/registerBug" },
    null,
    baseUrl + "/registerBug"
  );
});

const title = document.getElementById("id_title");
const content = document.getElementById("id_content");
const priority = document.getElementById("id_priority");
const project = document.getElementById("id_project");
const bugCsrf = document.getElementsByName("csrfmiddlewaretoken")[0];

document.getElementById("submitBugForm").addEventListener("click", () => {
  let bugFormFields = new FormData();
  bugFormFields.append("title", title.value);
  bugFormFields.append("content", content.value);
  bugFormFields.append("project", project.value);
  bugFormFields.append("priority", priority.value);

  submitForm(bugCsrf, bugFormFields);
});

// end of bug registration page

// active and solved bugs pages

activeBugs.addEventListener("click", () => {
  fetchBugs();
  showPage("activeBugs");
  closeNavBarMenu();
  history.pushState(
    { section: baseUrl + "/activeBugs" },
    null,
    baseUrl + "/activeBugs"
  );
});

solved.addEventListener("click", () => {
  fetchBugs(1, true);
  showPage("resolvedBugs");
  closeNavBarMenu();
  history.pushState(
    { section: baseUrl + "/resolvedBugs" },
    null,
    baseUrl + "/resolvedBugs"
  );
});

export function fetchBugs(page = null, solvedBugsPage = false) {
  fetch(
    `/api/${solvedBugsPage ? "solved" : "active"}/?format=json${
      page ? "&page=" + page : ""
    }`
  )
    .then((response) => response.json())

    // check if data received. Use it to create list of html elements
    .then((data) =>
      data
        ? [
            data.results.map((bug) => createBugHtmlElement(bug)),
            createPagination(data.count),
          ]
        : (jsContent.innerHTML = "No active bugs...")
    )

    // if html elements, join html list and render out on page
    .then((html) =>
      html !== "No active bugs..."
        ? (jsContent.innerHTML =
            heading(solvedBugsPage) + html[0].join("") + html[1])
        : ""
    )
    .then(() => activatePaginationLinks())
    .then(() => activateResolveButtons())
    .then(() => activateContributorProfiles())
    .catch((err) => console.log(err));
}

export function createBugHtmlElement(bug) {
  // convert date to readable format
  const timeUnformatted = new Date(bug.date);
  const lastModifiedUnformatted = new Date(bug.last_modified);
  const time = formatDate(timeUnformatted);
  const lastModified = formatDate(lastModifiedUnformatted);

  // set class and text based on bug priority
  let className;
  let priority;
  const id = bug.id;
  switch (parseInt(bug.priority)) {
    case 1:
      className = "danger";
      priority = "High Priority";
      break;
    case 2:
      className = "warning";
      priority = "Medium Priority";
      break;
    case 3:
      className = "info";
      priority = "Low Priority";
      break;
  }

  if (bug.solved) {
    className = "success";
  }

  //create element with data from api
  return `
  <div class="card shadow dynamic-content" id="div${id}">
    <a href="#a${id}" class="d-block card-header py-3 collapsed" data-toggle="collapse" 
      role="button" aria-expanded="false" aria-controls="a${id}">
      <h6 class="m-0 font-weight-bold text-${className}">${bug.title}
        <span class="btn-sm ml-2 btn-${className} btn-circle">
          <i class="fas fa-${
            bug.solved ? "check" : "exclamation-triangle"
          }"></i>
        </span>
      </h6>
    </a>
    <div class="collapse" id="a${id}">
      <div class="card-body">
        <div class="project mb-4">
          <a
            href="/project/${bug.project.id}">
            <img
                style="width: 30px"
                class="rounded-circle"
                src="${bug.project.logo}"
                alt="${bug.project.title} logo"/>
            <strong class="f5 text-info">
              ${bug.project.title}
            </strong>
          </a>
          - ${priority}
        </div>
        <div class="content mb-2">
          <p class="ml-4">${bug.content}</p>
          ${
            bug.solved
              ? `<hr /><p>Resolved by <a class="contributor" data-username="${
                  bug.closed_by.username
                }">${
                  bug.closed_by.profile_picture
                    ? `<img width="30px" data-username="${bug.closed_by.username}" height="30px" style="border-radius: 50%; margin: 2px" src="${bug.closed_by.profile_picture}" alt="${bug.closed_by.username}'s profile picture">`
                    : ""
                }${bug.closed_by.username}</a> who wrote:</p>
                ${
                  bug.solved_text
                    ? `<p class="ml-4 mb-5 mr-4"><small>"${bug.solved_text}"</small></p>`
                    : ""
                }`
              : `
          <div class="resolved ml-4" id="resolvedDiv${id}">
          <button data-id="${id}" class="btn btn-sm btn-success btn-resolve">Resolve</button>
          </div>
          `
          }
        </div>
        
        <div class="text-right">
          <p class="mb-0">
            <small>Submitted by <a class="contributor" data-username="${
              bug.author.username
            }">
            </small>
            ${
              bug.author.profile_picture
                ? `<img width="30px" data-username="${bug.author.username}" height="30px" style="border-radius: 50%; margin: 2px" src="${bug.author.profile_picture}" alt="${bug.author.username}'s profile picture">`
                : ""
            }
            ${bug.author.username}
            </a>
            <small>on ${time}</small>
          </p>
          <hr class="my-1" />
          <p class="mb-0" >
            <small>Last Modified: ${lastModified}</small>
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}

export function activateResolveButtons() {
  const resolveButtons = document.querySelectorAll(".btn-resolve");
  resolveButtons.forEach((button) =>
    button.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const baseUrl = window.location.origin;
      const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];
      const resolved = document.getElementById(`resolvedDiv${id}`);
      const bug = document.getElementById(`div${id}`);
      // change to text box
      resolved.innerHTML = `<p>How did you resolve this bug?</p>
      <textarea maxlength="500" id="textarea${id}"></textarea>
      <button id="submit${id}" class="btn btn-success btn-sm mx-1">Submit</button>
      <button id="cancel${id}" class="btn btn-secondary btn-sm mx-1">Cancel</button>`;

      const content = document.getElementById(`textarea${id}`);
      const submit = document.getElementById(`submit${id}`);
      const cancel = document.getElementById(`cancel${id}`);

      const updateBug = () =>
        fetch(baseUrl + `/api/active/${id}/`, {
          method: "PATCH",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "X-CSRFToken": csrf.value,
          },
          // mark read as true
          body: JSON.stringify({ solved_text: content.value, solved: true }),
        })
          .then(() => (bug.style.display = "none"))
          .catch((err) => console.log(err));

      submit.addEventListener("click", () => updateBug());
      cancel.addEventListener("click", () => {
        resolved.innerHTML = `<button data-id="${id}" class="btn btn-sm btn-success btn-resolve">Resolve</button>`;
        activateResolveButtons();
      });
    })
  );
}
