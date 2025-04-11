"use strict";

/**
 * dynamically load the header from the header.html into the current page.
 */
function handleLogout(event: Event) {
    event.preventDefault();

    sessionStorage.removeItem("user");
    console.log("User logged out.");

    LoadHeader().then(() => {
        location.hash = "/";
    });
}

function CheckLogin() {
    console.log("Checking user login status...");

    const loginNav = document.getElementById("loginNav") as HTMLAnchorElement;

    if(!loginNav) {
        console.warn("lognav element not found, skipping CheckLogin().");
        return;
    }

    const userSession = sessionStorage.getItem("user");

    if (userSession) {
        loginNav.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
        loginNav.href = "#";
        loginNav.removeEventListener("click", handleLogout);
        loginNav.addEventListener("click", handleLogout);
    } else {
        loginNav.innerHTML = `<i class="fas fa-sign-out-alt"></i> Login`;

        loginNav.removeEventListener("click", handleLogout);
        loginNav.addEventListener("click", () => location.hash = "/login");

    }

}
export async function LoadHeader() : Promise<void> {
    console.log("Loading Header...");

    return fetch("./views/components/header.html")
        .then(response => response.text())
        .then(data => {
            const headerElement = document.querySelector('header');
            if (!headerElement) {
                console.error("No header element found");
                return;
            }
            headerElement.innerHTML = data;
            updateActiveNewLink();
            CheckLogin();
        })
        .catch(error => {console.error("Unable to load header.")});
}

export function updateActiveNewLink() {
    console.log("updateActiveNewLink....");

    const currentPath = location.hash.slice(1) || "/";
    const navLinks = document.querySelectorAll("nav a");

    navLinks.forEach((link) => {
        const linkPath = link.getAttribute("href")?.replace("#", "")|| "";

        if(currentPath === linkPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

