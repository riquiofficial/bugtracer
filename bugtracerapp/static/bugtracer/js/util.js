import { fetchBugs } from "./bugs.js";
import { fetchMessagesPage } from "./messages.js";
import { fetchProjects } from "./projects.js";

// dynamically show which div to display
export function showPage(page) {
  const bugForm = document.getElementById("registerBugForm");
  const projectForm = document.getElementById("registerProjectForm");
  const jsContent = document.getElementById("jsContent");

  jsContent.style.display = "none";
  bugForm.style.display = "none";
  projectForm.style.display = "none";
  if (page === "registerBug") {
    bugForm.style.display = "block";
  } else if (page == "registerProject") {
    projectForm.style.display = "block";
  } else if (page == "jsContent") {
    jsContent.style.display = "block";
  }
}

export function closeNavBarMenu() {
  const bugMenu = document.getElementById("bugMenu");
  const projectMenu = document.getElementById("projectMenu");
  if (!bugMenu.classList.contains("collapsed")) {
    bugMenu.click();
  } else if (!projectMenu.classList.contains("collapsed")) {
    projectMenu.click();
  }
}

export function submitForm(csrf, formData) {
  // bug form
  const title = document.getElementById("id_title");
  const content = document.getElementById("id_content");
  const priority = document.getElementById("id_priority");
  const project = document.getElementById("id_project");

  // project form
  const projectName = document.getElementById("project_name");
  const description = document.getElementById("id_description");
  const contributors = document.getElementById("id_contributors");
  const logo = document.getElementById("id_logo");

  fetch(window.location.origin, {
    method: "POST",
    mode: "same-origin",
    headers: {
      Accept: "application/json text/plain, */*",
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

  const clearBugForm = () => {
    title.value = "";
    content.value = "";
    priority.value = "";
    project.value = "";
  };

  const clearProjectForm = () => {
    projectName.value = "";
    contributors.value = "";
    description.value = "";
    logo.value = "";
  };
}

export function createPagination(count) {
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

export function activatePaginationLinks(projectsPage = false) {
  const pageButtons = document.querySelectorAll(".page-link");
  const solvedHeading = document.getElementById("bugHeading");
  const messagesHeading = document.getElementById("messagesHeading");
  let solvedPagination = false;

  // check if active or resolved bugs request by checking title of page
  if (solvedHeading) {
    solvedPagination = solvedHeading.innerHTML[0] === "S";
  }

  // send pagination link to the correct api page link
  pageButtons.forEach((li) => {
    li.addEventListener(
      "click",
      // if solved page, "solved=true" passes into fetchBugs to get solved data
      // using solvedPagination conditional
      (e) => {
        // check whether pagination being loaded for project page or bug page
        if (projectsPage) {
          fetchProjects(e.target.innerHTML);
        } else if (solvedPagination) {
          fetchBugs(e.target.innerHTML, solvedPagination);
        } else if (messagesHeading) {
          fetchMessagesPage(e.target.innerHTML);
        }

        // scroll to top when data loaded on page
        document.getElementsByClassName("scroll-to-top")[0].click();
      }
    );
  });
}

export function formatDate(date) {
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
