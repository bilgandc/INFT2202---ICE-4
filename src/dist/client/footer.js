"use strict";
export async function LoadFooter() {
    return fetch("views/components/footer.html")
        .then(res => res.text())
        .then(html => {
        const footerElement = document.querySelector('footer');
        if (footerElement) {
            footerElement.innerHTML = html;
        }
        else {
            console.warn("No <footer> element not found!");
        }
    })
        .catch(error => console.error("Failed to load footer.", error));
}
//# sourceMappingURL=footer.js.map