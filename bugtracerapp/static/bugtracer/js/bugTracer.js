// pages
import "./messages.js";
import "./alerts.js";
import "./bugs.js";
import "./projects.js";
import "./search.js";
import "./profile.js";
import "./teams.js";

// utilities/api
import { showPage } from "./util.js";
import { fetchBugs } from "./bugs.js";
import { fetchProjects } from "./projects.js";
import { fetchMessagesPage, sendMessage } from "./messages.js";
import { fetchAlertsPage } from "./alerts.js";
import { fetchProfile } from "./profile.js";
import { fetchTeamPage, fetchUserTeams } from "./teams.js";

document.addEventListener("DOMContentLoaded", () => {
  // check browser url in case of refresh or direct url to page
  const path = window.location.pathname;
  if (path === "/") {
    showPage();
  } else if (path === "/activeBugs") {
    fetchBugs();
    showPage("activeBugs");
  } else if (path === "/resolvedBugs") {
    fetchBugs(1, true);
    showPage("resolvedBugs");
  } else if (path === "/registerBug" || path === "/registerProject") {
    showPage(path.substring(1));
  } else if (path === "/allProjects") {
    fetchProjects();
    showPage("allProjects");
  } else if (path == "/messages") {
    fetchMessagesPage();
    showPage("jsContent");
  } else if (path == "/alerts") {
    fetchAlertsPage();
    showPage("jsContent");
  } else if (path == "/newMessage") {
    showPage("messagePage");
    const sendButton = document.getElementById("submitMessageForm");
    // ensure event does not duplicate when page re-opened
    sendButton.removeEventListener("click", sendMessage);
    sendButton.addEventListener("click", sendMessage);
  } else if (path.match(/^\/profile\//)) {
    // if profile in url, try to match a profile with username at end of url
    const requestedProfile = path.split("/").pop();
    fetchProfile(requestedProfile);
    showPage("jsContent");
  } else if (path == "/myTeams") {
    fetchUserTeams();
    showPage("jsContent");
  } else if (path.match(/^\/team\//)) {
    const requestedTeamId = path.split("/").pop();
    fetchTeamPage(requestedTeamId);
    showPage("jsContent");
  } else if (path == "/newTeam") {
    showPage("teamForm");
  }

  // browser history back/forward
  window.onpopstate = function (e) {
    const baseUrl = window.location.origin;
    const prevPage = e.state;

    if (prevPage == null) {
      showPage();
    } else if (prevPage.section == baseUrl + "/activeBugs") {
      fetchBugs();
      showPage("activeBugs");
    } else if (prevPage.section == baseUrl + "/resolvedBugs") {
      fetchBugs(1, true);
      showPage("resolvedBugs");
    } else if (prevPage.section == baseUrl + "/registerBug") {
      showPage("registerBug");
    } else if (prevPage.section == baseUrl + "/registerProject") {
      showPage("registerProject");
    } else if (prevPage.section == baseUrl + "/allProjects") {
      fetchProjects();
      showPage("allProjects");
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
      showPage("jsContent");
    } else if (prevPage.section == baseUrl + "/myTeams") {
      fetchUserTeams();
      showPage("jsContent");
    } else if (prevPage.section.match(/^\/team\//)) {
      const requestedTeamId = prevPage.section.split("/").pop();
      fetchTeamPage(requestedTeamId);
      showPage("jsContent");
    } else if (prevPage.section == "/newTeam") {
      showPage("teamForm");
    }
  };
});
