class ProjectButton extends HTMLElement
{
    connectedCallback()
    {
        const label = this.getAttribute("label") ?? "Untitled";
        const description = this.getAttribute("description") ?? "";
        const image = this.getAttribute("image") ?? "";
        const href = this.getAttribute("href") ?? "#";

        this.innerHTML = `
            <a class="project-button" href="${href}">
                    <img class="project-button__image" src="${image}" alt="">
                    
                    <div class="project-button__content">
                        <h3>${label}</h3>
                        <p>${description}</p>
                    </div>
            </a>
        `;
    }
}

customElements.define("project-button", ProjectButton);