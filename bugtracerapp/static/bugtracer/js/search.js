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

    .then(
      (html) =>
        (jsContent.innerHTML =
          '<h2 class="mb-3">Active Bugs</h2>' + html.join(""))
    )
    .then(showPage("jsContent"))
    .catch((err) => console.log(err));

  history.pushState(
    { section: baseUrl + "/search" },
    null,
    baseUrl + "/search"
  );
});
