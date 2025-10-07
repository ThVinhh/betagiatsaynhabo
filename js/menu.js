// js/menu.js
async function loadMenu() {
    const menuContainer = document.getElementById("menu");
    if (menuContainer) {
      const response = await fetch("menu.html");
      const html = await response.text();
      menuContainer.innerHTML = html;
    }
  }
  
  loadMenu();
  