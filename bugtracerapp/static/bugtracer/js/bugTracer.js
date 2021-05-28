document.addEventListener("DOMContentLoaded", () => {
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

  const bugForm = document.getElementById("registerBugForm");
  const projectForm = document.getElementById("registerProjectForm");
  const updateProjectForm = document.getElementById("updateProjectForm");
  const jsContent = document.getElementById("jsContent");
  const bugMenu = document.getElementById("bugMenu");
  const projectMenu = document.getElementById("projectMenu");

  // dynamically show which div to display
  function showPage(page) {
    jsContent.style.display = "none";
    bugForm.style.display = "none";
    projectForm.style.display = "none";
    updateProjectForm.style.display = "none";
    if (page === "registerBug") {
      bugForm.style.display = "block";
    } else if (page == "registerProject") {
      projectForm.style.display = "block";
    } else if (page == "jsContent") {
      jsContent.style.display = "block";
    } else if (page == "updateProject") {
      updateProjectForm.style.display = "block";
    }
  }

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

  const clearBugForm = () => {
    title.value = "";
    content.value = "";
    priority.value = "";
    project.value = "";
  };

  function submitForm(csrf, formData) {
    fetch(window.location.origin, {
      method: "POST",
      mode: "same-origin",
      headers: {
        "X-CSRFToken": csrf.value,
        "X-Requested-With": "XMLHttpRequest",
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => alert(result.message ? result.message : result.error))
      .then(() => clearBugForm())
      .then(() => clearProjectForm())
      .catch((err) => console.log(err));
  }

  // end of bug registration page

  // project registration page

  document
    .getElementById("registerNewProject")
    .addEventListener("click", () => {
      showPage("registerProject");
      closeNavBarMenu();
      history.pushState(
        { section: "registerProject" },
        null,
        "registerProject"
      );
    });

  const projectName = document.getElementById("project_name");
  const description = document.getElementById("id_description");
  const logo = document.getElementById("id_logo");
  const contributors = document.querySelector("#id_contributors");
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

  const clearProjectForm = () => {
    projectName.value = "";
    contributors.value = "";
    description.value = "";
    logo.value = "";
  };

  // end of project registration page

  // project list page

  document.getElementById("allProjects").addEventListener("click", () => {
    showPage("jsContent");
    fetchProjects();
    history.pushState({ section: "allProjects" }, null, "allProjects");
    closeNavBarMenu();
  });

  function fetchProjects(pageNumber) {
    fetch(
      `/api/projects/?format=json${pageNumber ? "&page=" + pageNumber : ""}`
    )
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

        window.location.href = window.location.origin + "/editproject/" + id;
      })
    );
  }

  // active and solved bugs pages

  activeBugs.addEventListener("click", () => {
    fetchBugs();
    showPage("jsContent");
    closeNavBarMenu();
    history.pushState({ section: "activeBugs" }, null, "ActiveBugs");
  });

  solved.addEventListener("click", () => {
    fetchBugs(1, true);
    showPage("jsContent");
    closeNavBarMenu();
    history.pushState({ section: "solved" }, null, "ResolvedBugs");
  });

  function fetchBugs(page = null, solvedBugsPage = false) {
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

  function createPagination(count) {
    // determine number of pages (10 objects per page as set in django settings)
    const pages = Math.ceil(count / 10);

    const containerStart =
      '<nav aria-label="Page navigation"><ul class="pagination justify-content-center my-4">';
    let pagination = [];
    const containerEnd = "</ul></nav>";

    // for each page number generate a new pagination button
    let i = 1;
    while (i <= pages) {
      const li = `<li class="page-item" style="cursor: pointer"><a class="page-link">${i}</a></li>`;
      pagination.push(li);
      i++;
    }

    return containerStart + pagination.join("") + containerEnd;
  }

  function formatDate(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    const strTime = hours + ":" + minutes + " " + ampm;

    return (
      date.getMonth() +
      1 +
      "/" +
      date.getDate() +
      "/" +
      date.getFullYear() +
      " " +
      strTime
    );
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

  function closeNavBarMenu() {
    if (!bugMenu.classList.contains("collapsed")) {
      bugMenu.click();
    } else if (!projectMenu.classList.contains("collapsed")) {
      projectMenu.click();
    }
  }

  function activatePaginationLinks(projectsPage = false) {
    const pageButtons = document.querySelectorAll(".page-link");
    const solvedHeading = document.getElementById("bugHeading");
    let solvedPagination = false;

    // check if resolved bugs request by checking title of page
    if (solvedHeading) {
      solvedPagination = solvedHeading.innerHTML[0] === "S";
    }

    // send pagination link to the correct api page link
    pageButtons.forEach((li) => {
      li.addEventListener(
        "click",
        // if solved page, "solved=true" passes into fetchBugs to get solved data
        // using solvedPagination conditional
        (e) =>
          // check whether pagination being loaded for project page or bug page
          projectsPage
            ? fetchProjects(e.target.innerHTML)
            : fetchBugs(e.target.innerHTML, solvedPagination),
        // scroll to top when data loaded on page
        document.getElementsByClassName("scroll-to-top")[0].click()
      );
    });
  }

  // browser history back/forward
  window.onpopstate = function (e) {
    const prevPage = e.state;
    if (prevPage == null || e.state == null) {
      showPage();
    } else if (prevPage.section == "activeBugs") {
      fetchBugs();
      showPage("jsContent");
    } else if (prevPage.section == "solved") {
      fetchBugs(1, true);
      showPage("jsContent");
    } else if (
      prevPage.section == "registerBug" ||
      prevPage.section == "registerProject"
    ) {
      showPage(prevPage.section);
    } else if (prevPage.section == "allProjects") {
      fetchProjects();
      showPage("jsContent");
    }
  };
});
