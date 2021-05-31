import {
  showPage,
  closeNavBarMenu,
  submitForm,
  createPagination,
  activatePaginationLinks,
  formatDate,
} from "./util.js";
// project registration page

const jsContent = document.getElementById("jsContent");

document.getElementById("registerNewProject").addEventListener("click", () => {
  showPage("registerProject");
  closeNavBarMenu();
  history.pushState({ section: "registerProject" }, null, "registerProject");
});

const projectName = document.getElementById("project_name");
const description = document.getElementById("id_description");
const logo = document.getElementById("id_logo");
const projectCsrf = document.getElementsByName("csrfmiddlewaretoken")[1];

document.getElementById("submitProjectForm").addEventListener("click", () => {
  // get all contributors
  const contributorsSelected = document.querySelectorAll(
    "#id_contributors option:checked"
  );
  const contributorValues = Array.from(contributorsSelected).map(
    (el) => el.value
  );

  // construct form data for fetch function
  let formData = new FormData();
  formData.append("logo", logo.files[0]);
  formData.append("title", projectName.value);
  formData.append("contributors", contributorValues);
  formData.append("description", description.value);
  console.log(contributorValues);

  submitForm(projectCsrf, formData);
});

// end of project registration page

// project list page

document.getElementById("allProjects").addEventListener("click", () => {
  showPage("jsContent");
  fetchProjects();
  history.pushState({ section: "allProjects" }, null, "allProjects");
  closeNavBarMenu();
});

function fetchProjects(pageNumber) {
  fetch(`/api/projects/?format=json${pageNumber ? "&page=" + pageNumber : ""}`)
    .then((response) => response.json())
    // check if data received. Use it to create list of html elements
    .then((data) =>
      data
        ? [
            data.results.map((project) => createProjectHtmlElement(project)),
            createPagination(data.count),
          ]
        : (jsContent.innerHTML = "No active projects...")
    )
    // if html elements, join html list and render out on page
    .then((html) =>
      html !== "No active Projects..."
        ? [
            (jsContent.innerHTML =
              `<div class="container-fluid">
          <h1 class="h1 text-gray-800 my-5">Projects</h1>
        </div><div class="list-group>` +
              html[0].join("") +
              "</div>" +
              html[1]),
          ]
        : ""
    )
    .then(() => activatePaginationLinks(true))
    .then(() => activateProjectEditButtons())
    .catch((err) => console.log(err));
}

function createProjectHtmlElement(project) {
  const timeUnformatted = new Date(project.date);
  const time = formatDate(timeUnformatted);

  return `
<div className="list">
  <a class="list-group-item list-group-item-action" data-toggle="modal" data-target="#project-${
    project.id
  }">
  
    <p class="h4 text-info">
    ${
      project.logo
        ? `<img class="mr-4 rounded-circle" style="width: 60px; height: 60px"
    src="${project.logo}" alt="${project.title} logo">`
        : ""
    }
       <span id="project_title${project.id}">${project.title}</span>
    </p>
    <p id="project_description${project.id}">${project.description}</p>
  </a>
  </div>

<div id="project-${
    project.id
  }" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content" >
      <div class="modal-header">
      ${
        project.logo
          ? `<img class="mr-4 rounded-circle" style="width: 60px; height: 60px"
      src="${project.logo}" alt="${project.title} logo"
      />`
          : ""
      }
          <h5 class="modal-title" id="projectTitle${project.id}">
          ${project.title}</h5>
          <button class="close" type="button" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
          </button>
      </div>
      <div class="modal-body" id="project-content${project.id}">
      <p id="projectDescription${project.id}">${project.description}</p>
      <p><small>Contributors:</p> 
      <ul style="list-style: none">
      ${project.contributors
        .map(
          (
            contributor
          ) => `<li style="padding: 3px"><img src="${contributor.profile_picture}" 
      width="40px" height="40px" class="rounded-circle" alt="${contributor.username}'s profile picture">
      ${contributor.username}</li>`
        )
        .join("")}
        
        </ul></small>
        <p class="mb-0 text-right"><small>Date Created: ${time}</small></p>
      </div>
      <div class="modal-footer">
          <button class="btn btn-secondary btn-cancel" id="project-cancel-${
            project.id
          }" type="button" data-dismiss="modal">Cancel</button>
          <a class="btn btn-info editProjectBtn" data-id="${
            project.id
          }" id="editProject${project.id}">Edit</a>
      </div>
    </div>
  </div>
</div>
`;
}

function activateProjectEditButtons() {
  // get all edit buttons
  const editProjectButtons = document.querySelectorAll(".editProjectBtn");
  // add event listeners to each
  editProjectButtons.forEach((button) =>
    button.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      // send to edit page on click
      window.location.href = window.location.origin + "/editproject/" + id;
    })
  );
}
