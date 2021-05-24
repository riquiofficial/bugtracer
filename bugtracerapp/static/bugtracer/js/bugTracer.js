document.addEventListener("DOMContentLoaded", () => {
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
  const jsContent = document.getElementById("jsContent");
  const bugMenu = document.getElementById("bugMenu");
  const projectMenu = document.getElementById("projectMenu");

  // dynamically show which div to display
  function showPage(page) {
    jsContent.style.display = "none";
    bugForm.style.display = "none";
    projectForm.style.display = "none";

    if (page === "registerBug") {
      bugForm.style.display = "block";
    } else if (page === "jsContent") {
      jsContent.style.display = "block";
    } else if (page == "registerProject") {
      projectForm.style.display = "block";
    }
  }

  // bug registration page

  document.getElementById("registerBug").addEventListener("click", () => {
    showPage("registerBug");
    closeNavBarMenu();
    history.pushState({ section: "registerBug" }, null, "registerBug");
  });

  document.getElementById("submitBugForm").addEventListener("click", () => {
    submitBugForm();
  });

  const title = document.getElementById("id_title");
  const content = document.getElementById("id_content");
  const priority = document.getElementById("id_priority");
  const project = document.getElementById("id_project");
  const bugCsrf = document.getElementsByName("csrfmiddlewaretoken")[0];

  const clear = () => {
    title.value = "";
    content.value = "";
    priority.value = "";
    project.value = "";
  };

  function submitBugForm() {
    const baseUrl = window.location.hostname;
    const request = new Request(baseUrl, {
      headers: { "X-CSRFToken": bugCsrf.value },
    });

    fetch(request, {
      method: "POST",
      body: JSON.stringify({
        title: title.value,
        content: content.value,
        priority: priority.value,
        project: project.value,
      }),
    })
      .then((response) => response.json())
      .then((result) => alert(result.message ? result.message : result.error))
      .then(() => clear())
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

  // end of project registration page

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
              data.results.map((bug) => createHtmlElement(bug)),
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
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
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

  function createHtmlElement(obj) {
    // convert date to readable format
    const timeUnformatted = new Date(obj.date);
    const lastModifiedUnformatted = new Date(obj.last_modified);
    const time = formatDate(timeUnformatted);
    const lastModified = formatDate(lastModifiedUnformatted);

    // set class and text based on object priority
    let className;
    let priority;
    const id = obj.id;
    switch (parseInt(obj.priority)) {
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

    if (obj.solved) {
      className = "success";
    }

    //create element with data from api
    return `
  <div class="card shadow">
    <a href="#a${id}" class="d-block card-header py-3 collapsed" data-toggle="collapse" 
      role="button" aria-expanded="false" aria-controls="a${id}">
      <h6 class="m-0 font-weight-bold text-${className}">${obj.title}
        <span class="btn-sm ml-2 btn-${className} btn-circle">
          <i class="fas fa-${
            obj.solved ? "check" : "exclamation-triangle"
          }"></i>
        </span>
      </h6>
    </a>
    <div class="collapse" id="a${id}">
      <div class="card-body">
        <div class="project mb-4">
          <a
            href="/project/${obj.project.id}">
            <img
                style="width: 30px"
                class="rounded-circle"
                src="${obj.project.logo}"
                alt="${obj.project.title} logo"/>
            <strong class="f5 text-info">
              ${obj.project.title}
            </strong>
          </a>
          - ${priority}
        </div>
        <div class="content mb-2">
          <p class="ml-4">${obj.content}</p>
          ${
            obj.solved
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
            <small>Submitted by <a href="/profile/${obj.author.username}">
            </small>${obj.author.username}
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

  function activatePaginationLinks() {
    const pageButtons = document.querySelectorAll(".page-link");
    const solvedHeading = document.getElementById("bugHeading");
    const solvedPagination = solvedHeading.innerHTML[0] === "S";
    // send pagination link to the correct api page link
    pageButtons.forEach((li) =>
      li.addEventListener(
        "click",
        (e) => fetchBugs(e.target.innerHTML, solvedPagination),
        // scroll to top when data loaded on page
        document.getElementsByClassName("scroll-to-top")[0].click()
      )
    );
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
    }
  };
});
