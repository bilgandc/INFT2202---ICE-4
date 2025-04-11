"use strict";
let sessionTimeout;
function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        console.warn("Session timed out.");
        sessionStorage.removeItem("user");
        // dispatch a global event to redirect the user
        window.dispatchEvent(new CustomEvent("sessionExpired"));
    }, 15 * 60 * 1000); //15 minutes timeout
}
document.addEventListener("mousemove", resetSessionTimeout);
document.addEventListener("keypress", resetSessionTimeout);
export function AuthGuard() {
    const user = sessionStorage.getItem("user");
    const protectedRoutes = ["/contact-list", "/edit"];
    if (!user && protectedRoutes.includes(location.hash.slice(1))) {
        console.log("[AUTHGUARD] unauthorized access detected. Redirecting to login page.");
        window.dispatchEvent(new CustomEvent("sessionExpired"));
    }
    else {
        resetSessionTimeout();
    }
}
//# sourceMappingURL=authguard.js.map