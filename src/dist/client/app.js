// IIFE
"use strict";
import { LoadHeader } from "./header";
import { Router } from "./router";
import { LoadFooter } from "./footer";
import { AuthGuard } from "./authguard";
import { deleteContact, fetchContact, fetchContacts } from "./api/contacts/index.js";
import { AddContact, addEventListenerOnce, attachValidationListeners, DisplayWeather, handleEditClick, validateForm } from "./utils";
const pageTitles = {
    "/": "Home",
    "/about": "About",
    "/login": "Login Page",
    "/register": "Register",
    "/contact": "Contact",
    "/services": "Services",
    "/products": "Products",
    "/contact-list": "Contact List",
    "/edit": "Edit Contact",
    "/404": "Page Not Found",
};
const routes = {
    "/": "views/pages/home.html",
    "/about": "views/pages/about.html",
    "/login": "views/pages/login.html",
    "/register": "views/pages/register.html",
    "/contact": "views/pages/contact.html",
    "/services": "views/pages/services.html",
    "/products": "views/pages/products.html",
    "/contact-list": "views/pages/contact-list.html",
    "/edit": "views/pages/edit.html",
    "/404": "views/pages/404.html"
};
const router = new Router(routes);
(function () {
    function DisplayLoginPage() {
        console.log("DisplayLoginPage called...");
        const messageArea = document.getElementById("messageArea");
        const loginButton = document.getElementById("loginButton");
        const cancelButton = document.getElementById("cancelButton");
        const loginForm = document.getElementById("loginForm");
        if (!loginButton) {
            console.error("Unable to login buton not found");
            return;
        }
        loginButton.addEventListener("click", async (event) => {
            event.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            try {
                // the await keyword tell javascript to pause here (thread) until the fetch request completes
                const response = await fetch("/users");
                if (!response.ok)
                    throw new Error(`HTTP error: ${response.status}`);
                const jsonData = await response.json();
                const users = jsonData.users;
                let authenticateUser = users.find((user) => user.Username === username && user.password === password);
                if (authenticateUser) {
                    sessionStorage.setItem("user", JSON.stringify({
                        DisplayName: authenticateUser.displayName,
                        EmailAddress: authenticateUser.emailAddress,
                        Username: authenticateUser.username,
                    }));
                    if (messageArea) {
                        messageArea.classList.remove("alert", "alert-danger");
                        messageArea.style.display = "none";
                    }
                    LoadHeader().then(() => {
                        router.navigate("/contact-list");
                    });
                }
                else {
                    if (messageArea) {
                        messageArea.classList.add("alert", "alert-danger");
                        messageArea.textContent = "Invalid user or password, please try again.";
                        messageArea.style.display = "block";
                    }
                    document.getElementById("username").focus();
                    document.getElementById("username").select();
                }
            }
            catch (error) {
                console.error("Login failed.", error);
            }
        });
        // handle error event
        if (cancelButton && loginForm) {
            cancelButton.addEventListener("click", (event) => {
                loginForm.reset();
                router.navigate("/");
            });
        }
        else {
            console.warn("cancelButton not found.");
        }
    }
    function DisplayRegisterPage() {
        console.log("DisplayRegisterPage called...");
    }
    /**
     * handles the process of adding a new contact
     * @param event - the event object to prevent the default form submission
     */
    function handleAddClick(event) {
        event.preventDefault();
        if (!validateForm()) {
            alert("Form contains errors. Please correct them before submitting");
            return;
        }
        const fullName = document.getElementById("fullName").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const emailAddress = document.getElementById("emailAddress").value;
        // create and save new contact
        AddContact(fullName, contactNumber, emailAddress, router);
        // redirect to contact list
        router.navigate("contact-list");
    }
    async function DisplayEditPage() {
        console.log("DisplayEditPage() called...");
        // extract contact id from the path
        //const page = location.hash.split("#")[2];
        const hashPaths = location.hash.split("#");
        // http:localhost:3000/#/edit#add
        // hashParts: split(#) -> ["","edit", "add"]
        const page = hashPaths.length > 2 ? hashPaths[2] : "add";
        const editButton = document.getElementById("editButton");
        const pageTitle = document.querySelector("main > h1");
        const cancelButton = document.getElementById("cancelButton");
        if (!pageTitle || !editButton || !cancelButton) {
            console.error("main title not found!");
            return;
        }
        if (page === "add") {
            document.title = "Add Contact";
            pageTitle.textContent = "Add Contact";
            editButton.innerHTML = `<i class = "fa-solid fa-user-plus fa-sm"></i> Add`;
            editButton.classList.remove("btn-primary");
            editButton.classList.add("btn-primary");
        }
        else {
            editButton.innerHTML = `<i class = "fa-solid fa-user-plus fa-sm"></i> Edit`;
            editButton.classList.remove("btn-success");
            editButton.classList.add("btn-primary");
            try {
                document.title = "Edit Contact";
                pageTitle.textContent = "Edit Contact";
                const contact = await fetchContact(page);
                document.getElementById("fullName").value = contact.fullName;
                document.getElementById("contactNumber").value = contact.contactNumber;
                document.getElementById("emailAddress").value = contact.emailAddress;
            }
            catch {
                console.error("Could not find contact");
                router.navigate("/contact-list");
                return;
            }
            addEventListenerOnce("editButton", "click", async (event) => {
                event.preventDefault();
                if (page === "add") {
                    const fullName = document.getElementById("fullName").value.trim();
                    const contactNumber = document.getElementById("contactNumber").value.trim();
                    const emailAddress = document.getElementById("emailAddress").value.trim();
                    await AddContact(fullName, contactNumber, emailAddress, router);
                }
                else {
                    await handleEditClick(event, page, router);
                }
            });
            addEventListenerOnce("cancelButton", "click", (event) => {
                event.preventDefault();
                router.navigate("/contact-list");
            });
            attachValidationListeners();
        }
    }
    async function DisplayContactListPage() {
        console.log("Called DisplayContactListPage()");
        const contactList = document.getElementById("contactList");
        if (!contactList) {
            console.warn("Could not find contact list!");
            return;
        }
        try {
            const contacts = await fetchContacts();
            let data = "";
            let index = 1;
            contacts.forEach((contact) => {
                data += `<tr>
                                     <th scope="row" class="text-center">${index}</th>
                                     <td>${contact.fullName}</td>
                                     <td>${contact.contactNumber}</td>
                                     <td>${contact.emailAddress}</td>
                                     <td class="text-center">
                                        <button value="${contact.id}" class="btn btn-warning btn-sm edit">
                                            <i class="fa-solid fa-pen-to-square"></i> Edit
                                        </button>
                                    </td>
                                     <td class="text-center">
                                        <button value="${contact.id}" class="btn btn-warning btn-sm delete">
                                            <i class="fa-solid fa-trash"></i> Delete
                                        </button>
                                     </td>
                                     </tr>`;
                index++;
            });
            contactList.innerHTML = data;
            const addButton = document.getElementById("addButton");
            if (addButton) {
                addButton.addEventListener("click", () => {
                    router.navigate("/edit#add");
                });
            }
            document.querySelectorAll("button.delete").forEach((button) => {
                button.addEventListener("click", async function (event) {
                    const targetButton = event.target;
                    const contactId = targetButton.value;
                    if (confirm("Delete contact, please confirm.")) {
                        try {
                            await deleteContact(contactId);
                            await DisplayContactListPage();
                        }
                        catch (error) {
                            console.error("Failed to delete contact", error);
                        }
                    }
                });
            });
            const editButtons = document.querySelectorAll("button.edit");
            editButtons.forEach((button) => {
                button.addEventListener("click", function (event) {
                    // concatenate the value from the edit line to the edit.html
                    const targetButton = event.target;
                    const contactKey = targetButton.value;
                    router.navigate(`/edit#${contactKey}`);
                });
            });
        }
        catch (error) {
            console.error("Failed to display contacts.");
        }
    }
    //STOP
    function DisplayHomePage() {
        console.log("Calling DisplayHomePage()...");
        const aboutUsBtn = document.getElementById("AboutUsBtn");
        if (aboutUsBtn) {
            aboutUsBtn.addEventListener("click", (event) => {
                router.navigate("/about");
            });
        }
        // calling weathermap.org
        DisplayWeather();
    }
    function DisplayAboutPage() {
        console.log("Calling DisplayAbout()...");
    }
    function DisplayProductPage() {
        console.log("Calling DisplayProduct()...");
    }
    function DisplayServicesPage() {
        console.log("Calling DisplayServices()...");
    }
    function DisplayContactPage() {
        console.log("Calling DisplayContact()...");
        let sendButton = document.getElementById("sendButton");
        let subscribeCheckBox = document.getElementById("subscribeCheckBox");
        let contactListButton = document.getElementById("showContactList");
        if (!sendButton) {
            console.warn("Could not find sendButton");
        }
        sendButton.addEventListener("click", function (event) {
            event.preventDefault();
            if (!validateForm()) {
                alert("Please fill out the form");
                return;
            }
            if (subscribeCheckBox && subscribeCheckBox.checked) {
                const fullName = document.getElementById("fullName").value;
                const contactNumber = document.getElementById("contactNumber").value;
                const emailAddress = document.getElementById("emailAddress").value;
                AddContact(fullName, contactNumber, emailAddress, router);
            }
            alert("Form submitted successfully");
        });
        if (contactListButton) {
            contactListButton.addEventListener("click", function (event) {
                event.preventDefault();
                router.navigate("/contactList");
            });
        }
    }
    document.addEventListener("routerLoaded", (event) => {
        if (!(event instanceof CustomEvent) || typeof event.detail !== "string") {
            console.warn("Could not find event");
            return;
        }
        const newPath = event.detail; // extract the route from the event passes
        console.log(`Route Loaded: ${newPath}`);
        LoadHeader().then(() => {
            handlePageLogin(newPath);
        });
    });
    window.addEventListener("sessionExpired", () => {
        console.warn(`Could not find sessionExpired`);
        router.navigate("/login");
    });
    function handlePageLogin(path) {
        document.title = pageTitles[path] || "Untitled Page";
        //check authentication
        const protectedRoute = ["/contact-list", "/edit"];
        if (protectedRoute.includes(path)) {
            AuthGuard();
        }
        switch (path) {
            case "/":
                DisplayHomePage();
                break;
            case "/about":
                DisplayAboutPage();
                break;
            case "/contact":
                DisplayContactPage();
                attachValidationListeners();
                break;
            case "/products":
                DisplayProductPage();
                break;
            case "/contact-list":
                DisplayContactListPage();
                break;
            case "/edit":
                DisplayEditPage();
                attachValidationListeners();
                break;
            case "/services":
                DisplayServicesPage();
                break;
            case "/login":
                DisplayLoginPage();
                break;
            case "/register":
                DisplayRegisterPage();
                break;
            default:
                console.log(`No display logic found for ${path}`);
        }
    }
    async function Start() {
        console.log("Starting...");
        console.log(`Current document title: ${document.title}`);
        // lead navbar
        await LoadHeader();
        await LoadFooter();
        AuthGuard();
        const currentPath = location.hash.slice(1) || "/";
        router.navigate(currentPath);
    }
    window.addEventListener("DOMContentLoaded", () => {
        console.log("DOM fully loaded and parsed");
        Start();
    });
})();
//# sourceMappingURL=app.js.map