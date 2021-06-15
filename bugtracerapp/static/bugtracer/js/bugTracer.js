// pages
import "./messages.js";
import "./alerts.js";
import "./bugs.js";
import "./projects.js";
import "./search.js";
import "./profile.js";

// utilities/api
import { showPage } from "./util.js";
import { fetchBugs } from "./bugs.js";
import { fetchProjects } from "./projects.js";
import { fetchMessagesPage } from "./messages.js";
import { fetchAlertsPage } from "./alerts.js";
import { fetchProfile } from "./profile.js";

document.addEventListener("DOMContentLoaded", () => {
  // check browser url in case of refresh or direct url to page
  const path = window.location.pathname;
  if (path === "/") {
    showPage();
  } else if (path === "/activeBugs") {
    fetchBugs();
    showPage("jsContent");
  } else if (path === "/resolvedBugs") {
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
  } else if (path == "/newMessage") {
    showPage("messagePage");
  } else if (path.match(/^\/profile\//)) {
    // if profile in url, try to match a profile with username at end of url
    const requestedProfile = path.split("/").pop();
    fetchProfile(requestedProfile);
    showPage("jsContent");
  }
  // browser history back/forward
  window.onpopstate = function (e) {
    const baseUrl = window.location.origin;
    const prevPage = e.state;

    if (prevPage == null) {
      showPage();
    } else if (prevPage.section == baseUrl + "/activeBugs") {
      fetchBugs();
      showPage("jsContent");
    } else if (prevPage.section == baseUrl + "/resolvedBugs") {
      fetchBugs(1, true);
      showPage("jsContent");
    } else if (prevPage.section == baseUrl + "/registerBug") {
      showPage("registerBug");
    } else if (prevPage.section == baseUrl + "/registerProject") {
      showPage("registerProject");
    } else if (prevPage.section == baseUrl + "/allProjects") {
      fetchProjects();
      showPage("jsContent");
    } else if (prevPage.section == baseUrl + "/messages") {
      fetchMessagesPage();
      showPage("jsContent");
    } else if (prevPage.section == baseUrl + "/alerts") {
      fetchAlertsPage();
      showPage("jsContent");
    } else if (prevPage.section == baseUrl + "/newMessage") {
      showPage("messagePage");
    } else if (prevPage.section.match(/^\/profile\//)) {
      const requestedProfile = prevPage.section.split("/").pop();
      fetchProfile(requestedProfile);
    }
  };
});
