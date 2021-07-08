import { fetchBugs } from "./bugs.js";
import { fetchMessagesPage } from "./messages.js";
import { fetchProjects } from "./projects.js";
import { fetchAlertsPage } from "./alerts.js";
import { fetchProfile } from "./profile.js";

// dynamically show which div to display
export function showPage(page) {
  const bugForm = document.getElementById("registerBugForm");
  const projectForm = document.getElementById("registerProjectForm");
  const jsContent = document.getElementById("jsContent");
  const messageForm = document.getElementById("messageForm");
  const dashboard = document.getElementById("dashboard");
  const teamForm = document.getElementById("teamForm");

  jsContent.style.display = "none";
  bugForm.style.display = "none";
  projectForm.style.display = "none";
  messageForm.style.display = "none";
  dashboard.style.display = "none";
  teamForm.style.display = "none";

  // nav styles
  const navBugs = document.getElementById("nav-bugs").classList;
  const navDashboard = document.getElementById("nav-dashboard").classList;
  const navProjects = document.getElementById("nav-projects").classList;

  navBugs.remove("active");
  navDashboard.remove("active");
  navProjects.remove("active");

  if (page === "registerBug") {
    bugForm.style.display = "block";
    navBugs.add("active");
  } else if (page == "registerProject") {
    projectForm.style.display = "block";
    navProjects.add("active");
  } else if (page == "jsContent") {
    jsContent.style.display = "block";
  } else if (page == "activeBugs") {
    jsContent.style.display = "block";
    navBugs.add("active");
  } else if (page == "resolvedBugs") {
    jsContent.style.display = "block";
    navBugs.add("active");
  } else if (page == "messagePage") {
    messageForm.style.display = "block";
  } else if (page == null) {
    dashboard.style.display = "block";
    navDashboard.add("active");
  } else if (page == "allProjects") {
    jsContent.style.display = "block";
    navProjects.add("active");
  } else if (page == "teamForm") {
    teamForm.style.display = "block";
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

  // message form
  const messageContent = document.getElementById("messageContent");
  const receiver = document.getElementById("id_receiver");

  // new team form
  const teamForm = document.getElementById("group_name");

  // invite user form
  const username = document.getElementById("invite_user");

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
    .then(() => clearAllForms())
    .catch((err) => console.log(err));

  function clearAllForms() {
    title.value = "";
    content.value = "";
    priority.value = "";
    project.value = "";
    projectName.value = "";
    contributors.value = "";
    description.value = "";
    logo.value = "";
    messageContent.value = "";
    receiver.value = "";
    teamForm.value = "";
    username.value = "";
  }
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
  const alertsHeading = document.getElementById("alertsHeading");
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
        } else if (solvedHeading) {
          fetchBugs(e.target.innerHTML, solvedPagination);
        } else if (messagesHeading) {
          fetchMessagesPage(e.target.innerHTML);
        } else if (alertsHeading) {
          fetchAlertsPage(e.target.innerHTML);
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

export function activateContributorProfiles() {
  const userList = document.querySelectorAll(".contributor");
  userList.forEach((button) =>
    button.addEventListener("click", (e) => {
      const user = e.target.dataset.username;
      const id = e.target.dataset.id;
      let cancelButton = document.getElementById(`project-cancel-${id}`);
      cancelButton
        ? cancelButton
        : (cancelButton = document.getElementById(`message-cancel-${id}`));
      // if id present, close modal with corresponding id
      if (user !== undefined) {
        id ? cancelButton.click() : "";
        fetchProfile(user);
      }
    })
  );
}
