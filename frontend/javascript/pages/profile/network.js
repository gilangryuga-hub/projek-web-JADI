function initNetworkPage() {
  const status = document.getElementById("profile-status");
  const content = document.getElementById("profile-content");
  if (!status || !content) return;

  loadProfileData().then(data => {
    initProfileShell(data);
    document.getElementById("network-message").textContent = "Belum ada data following.";
    status.hidden = true;
    content.hidden = false;
  }).catch(error => {
    if (error.message === "Profil membutuhkan login") renderProfileLogin(status);
    else status.textContent = error.message || "Data network gagal dimuat.";
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initNetworkPage);
else initNetworkPage();
