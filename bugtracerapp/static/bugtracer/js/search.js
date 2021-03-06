import { showPage } from "./util.js";
import { createBugHtmlElement, activateResolveButtons } from "./bugs.js";
import {
  createProjectHtmlElement,
  activateProjectEditButtons,
} from "./projects.js";

const searchBtn = document.getElementById("submitSearch");
const query = document.getElementsByName("q")[0];
const mobileQuery = document.getElementsByName("q")[1];
const jsContent = document.getElementById("jsContent");
const baseUrl = window.location.origin;

const mobileSearchBtn = document.getElementById("submitMobileSearch");

mobileSearchBtn.addEventListener("click", (e) => search(e, true));
searchBtn.addEventListener("click", (e) => search(e));

function search(e, mobile = false) {
  {
    e.preventDefault();
    // clear page
    jsContent.innerHTML = "";
    showPage("jsContent");

    //   search database
    if (mobile) {
      searchBugs(true);
      searchSolvedBugs(true);
      searchProjects(true);
    } else {
      searchBugs();
      searchSolvedBugs();
      searchProjects();
    }

    history.pushState(
      { section: baseUrl + "/search" },
      null,
      baseUrl + "/search"
    );

    //   give search time to fetch data before activating page buttons
    setTimeout(function () {
      activateProjectEditButtons();
      activateResolveButtons();
    }, 2000);
  }
}

function searchBugs(mobile = false) {
  fetch(
    `/api/active/?format=json&search=${
      mobile ? mobileQuery.value : query.value
    }`
  )
    .then((response) => response.json())
    .then((data) =>
      data
        ? data.results.map((result) => createBugHtmlElement(result))
        : (jsContent.innerHTML = "No active bugs found...")
    )
    .then(
      (html) =>
        (jsContent.innerHTML =
          jsContent.innerHTML +
          '<h2 class="mx-2 mt-4 mb-2">Active Bugs</h2>' +
          html.join(""))
    )
    .catch((err) => console.log(err));
}

function searchSolvedBugs(mobile = false) {
  fetch(
    `/api/solved/?format=json&search=${
      mobile ? mobileQuery.value : query.value
    }`
  )
    .then((response) => response.json())
    .then((data) => data.results.map((result) => createBugHtmlElement(result)))
    .then(
      (html) =>
        (jsContent.innerHTML =
          jsContent.innerHTML +
          '<h2 class="mx-2 mt-4 mb-2">Solved Bugs</h2>' +
          html.join(""))
    )
    .catch((err) => console.log(err));
}

function searchProjects(mobile = false) {
  fetch(
    `/api/projects/?format=json&search=${
      mobile ? mobileQuery.value : query.value
    }`
  )
    .then((response) => response.json())
    .then((data) =>
      data.results.map((result) => createProjectHtmlElement(result))
    )
    .then(
      (html) =>
        (jsContent.innerHTML =
          jsContent.innerHTML +
          '<h2 class="mx-2 mt-4 mb-2">Projects</h2>' +
          html.join(""))
    )
    .catch((err) => console.log(err));
}
