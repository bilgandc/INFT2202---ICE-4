// IIFE
"use strict";
import { LoadHeader } from "./header.js";
import { Router } from "./router.js";
import { Contact } from "./contact.js";
import { LoadFooter } from "./footer.js";
import { AuthGuard } from "./authguard.js";
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
                const response = await fetch("data/users.json");
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const jsonData = await response.json();
                //console.log("fetched json data", jsonData);
                const users = jsonData.users;
                if (!Array.isArray(users)) {
                    throw new Error(`Unable to load users.`);
                }
                let success = false;
                let authenticateUser = null;
                for (const user of users) {
                    if (user.username === username && user.password === password) {
                        success = true;
                        authenticateUser = user;
                        break;
                    }
                }
                if (success) {
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
    // redirect the user back to contactlist.html
    function handleCancelClick() {
        router.navigate("contact-list");
    }
    function handleEditClick(event, contact, page) {
        // prevent default form submission
        event.preventDefault();
        if (!validateForm()) {
            alert("Please enter a valid email address");
            return;
        }
        // retrieve update values from the form fields
        const fullName = document.getElementById("fullName").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const emailAddress = document.getElementById("emailAddress").value;
        contact.fullName = fullName;
        contact.emailAddress = emailAddress;
        contact.contactNumber = contactNumber;
        // save the update contact back to local storage (csv format)
        localStorage.setItem(page, contact.serialize());
        // redirect
        router.navigate("contact-list");
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
        AddContact(fullName, contactNumber, emailAddress);
        // redirect to contact list
        router.navigate("contact-list");
    }
    function addEventListenerOnce(elementId, event, handler) {
        // retrieve tje element from the dom
        const element = document.getElementById(elementId);
        if (element) {
            element.removeEventListener(event, handler);
            element.addEventListener(event, handler);
        }
        else {
            console.log(`[WARN] Element with id ${elementId} not found!`);
        }
    }
    /**
     * validate the entire form by checking the validity of each input field
     * @returns {boolean} - return true if all field pass validation, false otherwise
     */
    function validateForm() {
        return (validateInput("fullName") &&
            validateInput("contactNumber") &&
            validateInput("emailAddress"));
    }
    function validateInput(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-Error`);
        const rule = VALIDATION_RULES[fieldId];
        if (!field || !errorElement || !rule) {
            console.log(`[WARN] Validation rule not found for ${fieldId}`);
            return false;
        }
        if (field.value.trim() === "") {
            errorElement.textContent = rule.errorMessage;
            errorElement.style.display = "block";
            return false;
        }
        // check if the input fails to match tje regex patter
        if (!rule.regex.test(field.value)) {
            errorElement.textContent = rule.errorMessage;
            errorElement.style.display = "block";
            return false;
        }
        // clear the error message if validation passes
        errorElement.textContent = "";
        errorElement.style.display = "none";
        return true;
    }
    function attachValidationListeners() {
        console.log("[INFO] Attaching validation listeners");
        // iterate over each field defined in VALIDATION_RULES
        Object.keys(VALIDATION_RULES).forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (!field) {
                console.warn("[WARNING] Field `${fieldId}` Attaching validation listener for field ]");
                return;
            }
            // attach event listener using a centralized v
            addEventListenerOnce(fieldId, "input", () => validateInput(fieldId));
        });
    }
    const VALIDATION_RULES = {
        fullName: {
            regex: /^[A-Za-z\s]+$/,
            errorMessage: "Full Name must contain onlt letters and spaces."
        },
        contactNumber: {
            regex: /^\d{3}-\d{3}-\d{4}$/,
            errorMessage: "Contact Number must be number format ###-###-###."
        },
        emailAddress: {
            regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            errorMessage: "Invalid email address."
        }
    };
    function AddContact(fullName, contactNumber, emailAddress) {
        console.log("[DEBUG] AddContact() triggered..");
        if (!validateForm()) {
            alert("Please enter a valid email address");
            return;
        }
        let contact = new Contact(fullName, contactNumber, emailAddress);
        const serializeContact = contact.serialize();
        if (serializeContact()) {
            // the primary key for a contact --> contact_ + date & time
            let key = `contact_${Date.now()}`;
            localStorage.setItem(key, contact.serialize());
        }
        else {
            console.error(`[ERROR] Add contact serizalition failed.`);
        }
        // redirect to contact list page
        router.navigate("contact-list");
    }
    function DisplayEditPage() {
        console.log("DisplayEditPage() called...");
        // extract contact id from the path
        //const page = location.hash.split("#")[2];
        const hashPaths = location.hash.split("#");
        const page = hashPaths.length > 2 ? hashPaths[2] : "";
        const editButton = document.getElementById("editButton");
        const pageTitle = document.querySelector("main > h1");
        if (!pageTitle) {
            console.error("main title not found!");
            return;
        }
        if (page === "add") {
            pageTitle.textContent = "Add Contact";
            if (editButton) {
                if (editButton) {
                    editButton.innerHTML = `<i class = "fa-solid fa-user-plus fa-sm"></i> Add`;
                    editButton.classList.remove("btn-primary");
                    editButton.classList.add("btn-primary");
                }
                addEventListenerOnce("editButton", "click", handleAddClick);
                addEventListenerOnce("cancelButton", "click", handleCancelClick);
            }
            else {
                if (!pageTitle) {
                    console.error("main title not found!");
                    return;
                }
                const contactData = localStorage.getItem(page);
                if (!contactData) {
                    console.warn("main title not found!");
                    return;
                }
                const contact = new Contact();
                contact.deserialize(contactData);
                document.getElementById("fullName").value = contact.fullName;
                document.getElementById("contactNumber").value = contact.contactNumber;
                document.getElementById("emailAddress").value = contact.emailAddress;
                if (editButton) {
                    editButton.innerHTML = `<i class = "fa-solid fa-user-plus fa-sm"></i> Edit`;
                    editButton.classList.remove("btn-success");
                    editButton.classList.add("btn-primary");
                }
                addEventListenerOnce("editButton", "click", (event) => handleEditClick(event, contact, page));
                addEventListenerOnce("cancelButton", "click", handleCancelClick);
            }
        }
        switch (page) {
            case "add":
                // update browser tip
                document.title = "Add Contact";
                document.querySelector("main>h1").textContent = "Add Contact";
                break;
            default: {
                // edit contact
                const contact = new core.Contact();
                const contactDate = localStorage.getItem(page);
                if (contactDate) {
                    contact.deserialize(contactDate);
                }
                document.getElementById("fullName").value = contact.fullName;
                document.getElementById("contactNumber").value = contact.contactNumber;
                document.getElementById("emailAddress").value = contact.emailAddress;
                const editButton = document.getElementById("editButton");
                const cancelButton = document.getElementById("cancelButton");
                if (editButton) {
                    editButton.addEventListener("click", (event) => {
                        event.preventDefault();
                        contact.fullName = document.getElementById("fullName").value;
                        contact.contactNumber = document.getElementById("contactNumber").value;
                        contact.emailAddress = document.getElementById("emailAddress").value;
                        if (editButton) {
                            editButton.innerHTML = `<i class = "fa-solid fa-user-plus fa-sm"></i> Add`;
                            editButton.classList.remove("btn-primary");
                            editButton.classList.add("btn-primary");
                        }
                        addEventListenerOnce(editButton, "click", (event) => handleEditClick(event, contact, page));
                        addEventListenerOnce(cancelButton, "click", handleCancelClick);
                        localStorage.setItem(page, contact.serialize());
                        router.navigate("contact-list");
                    });
                }
                if (cancelButton) {
                    cancelButton.addEventListener("click", (event) => {
                        router.navigate("contact-list");
                    });
                }
                break;
            }
        }
    }
    function DisplayWeather() {
        const apiKey = "e229a6d97d6f2c65b31cc7975b6fdeb3";
        const city = "Istanbul";
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        fetch(url)
            .then(response => {
            if (!response.ok)
                throw new Error("Failed to fetch weather");
            return response.json();
        })
            .then((data) => {
            const weatherElement = document.getElementById("weather-data");
            if (weatherElement) {
                weatherElement.innerHTML =
                    `<strong>City: </strong> ${data.name} <br>
                         <strong>Tempature: </strong> ${data.main.temp} <br>
                         <strong>Weather: </strong> ${data.weather[0].description}`;
            }
            else {
                console.warn("element with id weather-data not found");
            }
        })
            .catch((error) => {
            console.error(`Failed to fetch weather data`, error);
            const weatherElement = document.getElementById("weather-data");
            if (weatherElement) {
                weatherElement.textContent = "Unable to fetch weather data";
            }
        });
    }
    function DisplayContactListPage() {
        console.log("Called DisplayContactListPage()");
        const contactList = document.getElementById("contactList");
        if (!contactList) {
            console.warn("Could not find contact list!");
            return;
        }
        let data = "";
        let keys = Object.keys(localStorage);
        let index = 1;
        keys.forEach((key) => {
            if (key.startsWith("contact_")) {
                const contactData = localStorage.getItem(key);
                if (!contactData) {
                    console.warn("Could not find contact data!");
                    return;
                }
                try {
                    let contact = new Contact();
                    contact.deserialize(contactData); // deserialize contact csv to contact object
                    data += `<tr>
                                 <th scope="row" class="text-center">${index}</th>
                                 <td>${contact.fullName}</td>
                                 <td>${contact.contactNumber}</td>
                                 <td>${contact.emailAddress}</td>
                                 <td class="text-center">
                                    <button value="${key}" class="btn btn-warning btn-sm edit">
                                        <i class="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                </td>
                                 <td class="text-center">
                                    <button value="${key}" class="btn btn-warning btn-sm delete">
                                        <i class="fa-solid fa-trash"></i> Delete
                                    </button>
                                 </td>
                                 </tr>`;
                    index++;
                }
                catch (error) {
                    console.error("Could not find contact data!", error);
                }
            }
            else {
                console.warn(`Skipping non-contact (contact_) key: ${key}`);
            }
        });
        contactList.innerHTML = data;
        const addButton = document.getElementById("addButton");
        if (addButton) {
            addButton.addEventListener("click", () => {
                router.navigate("/edit#add");
            });
        }
        const deleteButtons = document.querySelectorAll("button.delete");
        deleteButtons.forEach((button) => {
            button.addEventListener("click", function () {
                const contactKey = this.value;
                console.log("Deleting contact....");
                if (!contactKey.startsWith("contact_")) {
                    console.error("Could not find contact!");
                    return;
                }
                if (confirm("Delete contact, please confirm.")) {
                    localStorage.removeItem(this.value);
                    DisplayContactListPage();
                }
            });
        });
        const editButtons = document.querySelectorAll("button.edit");
        editButtons.forEach((button) => {
            button.addEventListener("click", function () {
                // concatenate the value from the edit line to the edit.html
                router.navigate(`/edit#${this.value}`);
            });
        });
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
                AddContact(fullName, contactNumber, emailAddress);
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