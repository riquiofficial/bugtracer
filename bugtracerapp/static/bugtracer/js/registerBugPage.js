document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("registerBug").addEventListener("click", () => {
    showRegisterBugPage();
  });

  document.getElementById("submitBugForm").addEventListener("click", () => {
    submitBugForm();
  });

  function showRegisterBugPage() {
    const form = document.getElementById("registerBugForm");
    const jsContent = document.getElementById("jsContent");
    const bugMenu = document.getElementById("bugMenu");

    jsContent.style.display = "none";
    form.style.display = "block";
    bugMenu.click();
  }

  const title = document.getElementById("id_title");
  const content = document.getElementById("id_content");
  const priority = document.getElementById("id_priority");
  const project = document.getElementById("id_project");
  const csrf = document.getElementsByName("csrfmiddlewaretoken")[0];

  const clear = () => {
    title.value = "";
    content.value = "";
    priority.value = "";
    project.value = "";
  };

  function submitBugForm() {
    const request = new Request("", {
      headers: { "X-CSRFToken": csrf.value },
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
});
