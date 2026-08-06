class SiteIcon extends HTMLElement
{
    connectedCallback()
    {
        const name = this.getAttribute("name");
        const url = this.getAttribute("url");
        const icon = this.getAttribute("icon");

        this.innerHTML = `
            <a href="${url}" class="site-link">
                <img src="${icon}" alt="">
                <div>${name}</div>
            </a>
        `;
    }
}

customElements.define("site-icon", SiteIcon)