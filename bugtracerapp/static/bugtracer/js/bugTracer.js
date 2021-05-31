import "./messages.js";
import "./alerts.js";
import "./bugs.js";
import "./projects.js";
import { showPage, fetchBugs, fetchProjects } from "./util.js";

document.addEventListener("DOMContentLoaded", () => {
  // browser history back/forward
  window.onpopstate = function (e) {
    const prevPage = e.state;
    if (prevPage == null) {
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
