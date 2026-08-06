async function loadSites(){
    try {
        const response = await fetch("/data/frequently-accessed-sites.json");

        if (!response.ok) {
            throw new Error(`Could not load sites: ${response.status}`);
        }

        const sites = await response.json();

        const siteList = document.querySelector("#frequent-sites-list");

        for (const site of sites) {
            const siteElement = document.createElement("site-icon");

            siteElement.setAttribute("name", site.name);
            siteElement.setAttribute("url", site.url);
            siteElement.setAttribute("icon", site.icon);

            siteList.append(siteElement);
        }
    }
    catch(error){
        console.error("Failed to load the site list: ", error);
    }
}

loadSites();