import "./messages.js";
import "./alerts.js";
import "./bugs.js";
import "./projects.js";
import "./search.js";
import { showPage } from "./util.js";
import { fetchBugs } from "./bugs.js";
import { fetchProjects } from "./projects.js";
import { fetchMessagesPage } from "./messages.js";
import { fetchAlertsPage } from "./alerts.js";

document.addEventListener("DOMContentLoaded", () => {
  // check browser url in case of refresh
  const path = window.location.pathname;
  if (path === "/") {
    showPage();
  } else if (path === "/activeBugs") {
    fetchBugs();
    showPage("jsContent");
  } else if (path === "/solved") {
    fetchBugs(1, true);
    showPage("jsContent");
  } else if (path === "/registerBug" || path === "/registerProject") {
    showPage(path.substring(1));
  } else if (path === "/allProjects") {
    fetchProjects();
    showPage("jsContent");
  } else if (path == "/messages") {
    fetchMessagesPage();
    showPage("jsContent");
  } else if (path == "/alerts") {
    fetchAlertsPage();
    showPage("jsContent");
  }

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
    } else if (prevPage.section == "messages") {
      fetchMessagesPage();
      showPage("jsContent");
    } else if (prevPage.section == "alerts") {
      fetchAlertsPage();
      showPage("jsContent");
    }
  };
});
