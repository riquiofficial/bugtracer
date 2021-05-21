document.addEventListener("DOMContentLoaded", () => {
  const activeBugs = document.getElementById("activeBugs");
  const solved = document.getElementById("solved");

  const heading = (solvedBugsPage = false) => {
    return `<div class="container-fluid">
        <h1 id="bugHeading" class="h1 text-gray-800 my-5">${
          solvedBugsPage ? "Solved" : "Active"
        } Bugs</h1>
      </div>`;
  };

  const content = document.getElementById("jsContent");

  function hideRegisterBugPage() {
    const form = document.getElementById("registerBugForm");
    const jsContent = document.getElementById("jsContent");
    const bugMenu = document.getElementById("bugMenu");

    jsContent.style.display = "block";
    form.style.display = "none";
    bugMenu.click();
  }

  activeBugs.addEventListener("click", () => {
    fetchActive();
    hideRegisterBugPage();
  });

  solved.addEventListener("click", () => {
    fetchActive((page = 1), (solvedBugsPage = true));
    hideRegisterBugPage();
  });

  function fetchActive(page = null, solvedBugsPage = false) {
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
          : (content.innerHTML = "No active bugs...")
      )

      // if html elements, join html list and render out on page
      .then((html) =>
        html !== "No active bugs..."
          ? (content.innerHTML =
              heading(solvedBugsPage) + html[0].join("") + html[1])
          : ""
      )
      .then(() => closeNavBarMenu())
      .then(() => activatePageLinks())
      .catch((err) => console.log(err));
  }

  function createPagination(count) {
    // determine number of pages (10 objects per page as set in django settings)
    const pages = Math.ceil(count / 10);

    const containerStart =
      '<nav aria-label="Page navigation"><ul class="pagination justify-content-center my-4">';
    let pagination = [];
    const containerEnd = "</ul></nav>";

    // for each page number generate pagination button
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

    //create element with data from api
    return `
      <div class="card shadow">
    <a href="#a${id}" class="d-block card-header py-3 collapsed" data-toggle="collapse" 
      role="button" aria-expanded="false" aria-controls="a${id}">
      <h6 class="m-0 font-weight-bold text-${className}">${obj.title}
        <span class="btn-sm ml-2 btn-${priority} btn-circle">
          <i class="fas fa-exclamation-triangle"></i>
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
        <div className="content mb-2">
          <p class="ml-4">${obj.content}</p>
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
    bugMenu = document.getElementById("bugMenu");
    if (!bugMenu.classList.contains("collapsed")) {
      bugMenu.click();
    }
  }

  function activatePageLinks() {
    const pageButtons = document.querySelectorAll(".page-link");
    const solvedHeading = document.getElementById("bugHeading");
    const solvedPagination = solvedHeading.innerHTML[0] === "S";

    pageButtons.forEach((li) =>
      li.addEventListener(
        "click",
        (e) =>
          fetchActive(
            (page = e.target.innerHTML),
            (solvedBugsPage = solvedPagination)
          ),
        //scroll to top when data loaded on page
        document.getElementsByClassName("scroll-to-top")[0].click()
      )
    );
  }
});
