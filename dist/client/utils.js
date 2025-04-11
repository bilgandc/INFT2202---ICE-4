import { Contact } from "./contact";
import { createContact, updateContact } from "./api/contacts/index.js";
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
export function validateInput(fieldId) {
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
/**
 * validate the entire form by checking the validity of each input field
 * @returns {boolean} - return true if all field pass validation, false otherwise
 */
export function validateForm() {
    return (validateInput("fullName") &&
        validateInput("contactNumber") &&
        validateInput("emailAddress"));
}
export function addEventListenerOnce(elementId, event, handler) {
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
export function attachValidationListeners() {
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
export function DisplayWeather() {
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
export async function AddContact(fullName, contactNumber, emailAddress, router) {
    console.log("[DEBUG] AddContact() triggered..");
    if (!validateForm()) {
        alert("Please enter a valid email address");
        return;
    }
    try {
        const newContact = { fullName, contactNumber, emailAddress };
        await createContact(newContact);
        router.navigate("contact-list");
    }
    catch (error) {
        console.log("Error - Failed to add Contact");
    }
}
export async function handleEditClick(event, contactId, router) {
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
    try {
        await updateContact(contactId, { fullName, contactNumber, emailAddress });
        router.navigate("contact-list");
    }
    catch (error) {
        console.error("Error - Failed to update contact", error);
    }
}
// redirect the user back to contactlist.html
export function handleCancelClick(router) {
    router.navigate("contact-list");
}
export function saveToStorage(key, value) {
    try {
        let storageValue;
        // if it's a contact, use CSV format
        if (key.startsWith("contact_") && value instanceof Contact) {
            const serialized = value.serialize();
            if (!serialized) {
                console.error(`[ERROR] Add contact serizalition failed.`);
                return;
            }
            storageValue = serialized;
        }
        else {
            //otherwise store as JSON
            storageValue = JSON.stringify(value);
        }
        localStorage.setItem(key, storageValue);
        console.log(`Data saved to storage: ${key}`);
    }
    catch (error) {
        console.error(`Failed to save storage ${key}`, error);
    }
}
export function getFormStorage(key) {
    try {
        const data = localStorage.getItem(key);
        if (!data) {
            return null; // if no data found return null
        }
        //detect if key belongs to a contact
        if (key.startsWith("contact_")) {
            const contact = new Contact();
            contact.deserialize(data);
            return contact; //cast contact to generic T
        }
        return JSON.parse(data);
    }
    catch (error) {
        console.error(`Failed to get form storage ${key}`);
        return null; // return null instead of crashing
    }
}
export function removeFormStorage(key) {
    try {
        if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            console.log("data removed from storage");
        }
        else {
            console.warn(`key ${key} not found`);
        }
    }
    catch (error) {
        console.error(`Failed to remove form storage ${key}`);
    }
}
//# sourceMappingURL=utils.js.map