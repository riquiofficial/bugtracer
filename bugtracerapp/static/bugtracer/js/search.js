import { showPage } from "./util.js";
import { createBugHtmlElement } from "./bugs.js";
import { createProjectHtmlElement } from "./projects.js";

const searchBtn = document.getElementById("submitSearch");
const query = document.getElementsByName("q")[0];
const jsContent = document.getElementById("jsContent");
const baseUrl = window.location.origin;

searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  // fetch active bugs
  fetch(`/api/active/?format=json&search=${query.value}`)
    .then((response) => response.json())

    .then((data) => data.results.map((result) => createBugHtmlElement(result)))

    .then((html) =>
      html
        ? (jsContent.innerHTML =
            '<h2 class="mx-2 mt-4 mb-2">Active Bugs</h2>' + html.join(""))
        : (jsContent.innerHTML = "")
    )
    // solved bugs
    .then(
      fetch(`/api/solved/?format=json&search=${query.value}`)
        .then((response) => response.json())
        .then((data) =>
          data.results.map((result) => createBugHtmlElement(result))
        )
        .then(
          (html) =>
            (jsContent.innerHTML =
              jsContent.innerHTML +
              '<h2 class="mx-2 mt-4 mb-2">Solved Bugs</h2>' +
              html.join(""))
        )
    )
    // search projects
    .then(
      fetch(`/api/projects/?format=json&search=${query.value}`)
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
    )
    .then(showPage("jsContent"))
    .catch((err) => console.log(err));

  history.pushState(
    { section: baseUrl + "/search" },
    null,
    baseUrl + "/search"
  );
});
