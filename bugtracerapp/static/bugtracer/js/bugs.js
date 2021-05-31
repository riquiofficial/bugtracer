import {
  showPage,
  closeNavBarMenu,
  submitForm,
  createPagination,
  activatePaginationLinks,
  formatDate,
} from "./util.js";

const jsContent = document.getElementById("jsContent");

// nav menu items
const activeBugs = document.getElementById("activeBugs");
const solved = document.getElementById("solved");

// generate heading for active bug or solved bug page
const heading = (solvedBugsPage = false) => {
  return `<div class="container-fluid">
      <h1 id="bugHeading" class="h1 text-gray-800 my-5">${
        solvedBugsPage ? "Solved" : "Active"
      } Bugs</h1>
    </div>`;
};

// bug registration page

document.getElementById("registerBug").addEventListener("click", () => {
  showPage("registerBug");
  closeNavBarMenu();
  history.pushState({ section: "registerBug" }, null, "registerBug");
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
  showPage("jsContent");
  closeNavBarMenu();
  history.pushState({ section: "activeBugs" }, null, "activeBugs");
});

solved.addEventListener("click", () => {
  fetchBugs(1, true);
  showPage("jsContent");
  closeNavBarMenu();
  history.pushState({ section: "resolvedBugs" }, null, "resolvedBugs");
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
    .catch((err) => console.log(err));
}

function createBugHtmlElement(bug) {
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
  <div class="card shadow">
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
              ? ""
              : `
          <div class="resolved ml-4">
          <button id="resolvedButton" class="btn btn-sm btn-success">Resolve</button>
          </div>
          `
          }
        </div>
        
        <div class="text-right">
          <p class="mb-0">
            <small>Submitted by <a href="/profile/${bug.author.username}">
            </small>${bug.author.username}
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
