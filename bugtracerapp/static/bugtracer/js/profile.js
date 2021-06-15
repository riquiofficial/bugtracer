import { showPage } from "./util.js";

const jsContent = document.getElementById("jsContent");
const profileButton = document.getElementById("userProfileButton");
const activeUsername = document.getElementById("activeUsername").innerText;

const profilePage = (data) => {
  return `<div class="container-fluid dynamic-content">
      <img
        src="${data.profile_picture ? data.profile_picture : ""}"
        width="300px"
        alt="${data.username}'s profile picture"
      />
  
      <h1 class="h1 text-gray-800 my-5">${data.username}</h1>
      <h2 class="mb-4">Bio:</h2>
      <p>${data.bio}</p>
      <p class="">
        <a>Edit Profile</a>
      </p>
    </div>`;
};

export function fetchProfile(username) {
  const baseUrl = window.location.origin;
  fetch(`/api/profile/${username}/?format=json`)
    .then((response) => response.json())
    .then((data) => (jsContent.innerHTML = profilePage(data)))
    .then(showPage("jsContent"))
    .then(
      history.pushState(
        { section: baseUrl + "/profile/" + username },
        null,
        baseUrl + "/profile/" + username
      )
    )
    .catch((err) => console.log(err));
}

profileButton.addEventListener("click", () => fetchProfile(activeUsername));
