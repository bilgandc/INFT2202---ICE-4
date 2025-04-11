"use strict";

/**
 * Represents a Contact with a name, number and email address
 */


export class Contact {

    private _id: string;
    private _fullName: string;
    private _contactNumber: string;
    private _emailAddress: string;

    /**
     * Constructs a new contact instance
     * @param id
     * @param fullName
     * @param contactNumber
     * @param emailAddress
     */

    constructor(id: string = "" ,fullName : string = "", contactNumber : string = "", emailAddress : string = "") {
        this._id = id;
        this._fullName = fullName; // _ underscore = private attribute
        this._contactNumber = contactNumber;
        this._emailAddress = emailAddress;
    }

    /**
     * returns id of contact
     * */
    get id(): string {
        return this._id;
    }
    /**
     * Gets the full name of the contact
     * @returns {string}
     */

    get fullName(): string {
        return this._fullName;
    }

    /**
     * sets the id of the contact
     * @param id
     */
    set id(id: string) {
        this._id = id;
    }
    /**
     * sets the full name of the contact. validates input to ensure it is a non-empty string
     * @param fullName
     */

    set fullName(fullName : string) {
        if (fullName.trim() === "") {
            throw new Error("Invalid full name: it must be a string");
        }
        this._fullName = fullName;
    }

    /**
     * Gets the number of the contact
     * @returns {string}
     */

    get contactNumber(): string {
        return this._contactNumber;
    }

    /**
     * sets the contact number of the contact. validate input to ensure it matches 10 digit format
     * @param contactNumber
     */

    set contactNumber(contactNumber: string) {
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

        if (phoneRegex.test(contactNumber)) {
            throw new Error("Invalid phone number: must be a 10 digit number");
        }
        this._contactNumber = contactNumber;
    }

    /**
     * gets the email address
     * @returns {string}
     */
    get emailAddress(): string {
        return this._emailAddress;
    }

    /**
     * sets the email address of the contact. validate input to ensure a standard email format
     * @param address
     */
    set emailAddress(address: string) {
        const emailRegex = /^[^\s@]+@[\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(address)) {
            throw new Error("Invalid email address: must be non-empty string");
        }
        this._emailAddress = address;
    }

    /**
     * convert the contact details into a human-readable string
     * @returns {string}
     */
    toString(): string {
        return `Full Name: ${this._fullName}\n
                Contact Number: ${this._contactNumber}\n
                Email Address: ${this._emailAddress}`;

    }

    /**
     * serialize the contact details into a string format suitable for storage
     * @returns {string|null}
     */
    serialize(): string|null {
        if (!this._fullName || !this._contactNumber || !this._emailAddress) {
            console.error("One or more of the contact properties are missing or invalid");
            return null;
        }

        return `${this._fullName},${this._contactNumber},${this._emailAddress}`;
    }

    /**
     * deserialize a string (comma-delimited) of contact details and update properties
     * @param data
     */
    deserialize(data : string) {
        if (data.split(",").length !== 3) {
            console.error("Invalid data format for deserializing data.");
            return;
        }

        const propArray = data.split(",");
        this._fullName = propArray[0];
        this._contactNumber = propArray[1];
        this._emailAddress = propArray[2];
    }
}
