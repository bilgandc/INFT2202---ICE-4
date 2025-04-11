"use strict";
import { LoadHeader } from "./header.js";
export class Router {
    routes;
    constructor(routes) {
        this.routes = routes;
        this.init();
    }
    init() {
        window.addEventListener('DOMContentLoaded', () => {
            const path = location.hash.slice(1) || "/";
            console.log(`Initial Page Load: ${path}`);
            this.loadRoute(path);
        });
        //popstate fires when the user clicks the forward
        window.addEventListener("popstate", () => {
            console.log("Navigating to...");
            this.loadRoute(location.hash.slice(1));
        });
    }
    navigate(path) {
        location.hash = path;
    }
    loadRoute(path) {
        console.log(`Loading route: ${path}`);
        // Extract base path: /edit#contact_123 -> edit
        const basePath = path.split("#")[0];
        if (!this.routes[basePath]) {
            console.warn(`Route not found!: ${basePath}, redirecting to 404`);
            location.hash = "/404";
            path = "/404";
        }
        fetch(this.routes[basePath])
            .then(response => {
            if (!response.ok)
                throw new Error(`Failed to load ${this.routes[basePath]}`);
            return response.text();
        })
            .then(html => {
            const mainElement = document.querySelector("main");
            if (mainElement) {
                mainElement.innerHTML = html;
            }
            else {
                console.error("<main> element not found!");
            }
            // ensure the for example the header is reloaded in every page change
            LoadHeader().then(() => {
                document.dispatchEvent(new CustomEvent('routerLoaded', { detail: basePath }));
            });
        })
            .catch(error => console.error("Unable to load route", error));
    }
}
//# sourceMappingURL=router.js.map