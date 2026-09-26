const path = require("node:path")
const {v4 : uuid} = require("uuid")

const frogs = [
    { id: "2f3c4d5e-6f77-4b8d-a222-222222222222", name: "dashboard", file: "admin.html" },
    { id: "3a4b5c6d-7e88-4c9f-b333-333333333333", name: "articles", file: "articles (1).html" },
    { id: "4b5c6d7e-8f99-4dab-c444-444444444444", name: "article-form", file: "article-form.html" },
    { id: "5c6d7e8f-9011-4ebc-d555-555555555555", name: "consultations", file: "consultations.html" },
    { id: "6d7e8f90-1122-4fcd-e666-666666666666", name: "contacts", file: "contacts (1).html" },
    { id: "7e8f9011-2233-40de-f777-777777777777", name: "analytics", file: "analytics (1).html" },
    { id: "8f901122-3344-41ef-a888-888888888888", name: "settings", file: "settings.html" },
    { id: "90112233-4455-42fa-b999-999999999999", name: "index", file: "index.html" },
    { id: "a0112233-5566-43ab-c101-101010101010", name: "khadamat", file: "khadamat.html" },
    { id: "b1223344-6677-44bc-d202-202020202020", name: "articels", file: "articels.html" },
    { id: "c2334455-7788-45cd-e303-303030303030", name: "aboutus", file: "aboutus.html" },
    { id: "d3445566-8899-46de-f404-404040404040", name: "call", file: "call.html" },
    { id: "e4556677-9900-47ef-a505-505050505050", name: "storyus", file: "storyus.html" },
    { id: "k4559677-9988-48ef-a606-606060606060", name: "magale", file: "magale.html" },
    { id: "p45596s87-9999-48ef-a606-707070707070", name: "login", file: "loginuser.html" },
    { id: "9f902156-4455-42ef-a999-999999999999", name: "user", file: "user.html" },
    { id: "vf902156-6677-62ef-a309-8765689349380", name: "pocast", file: "pocast.html" },
    { id: "sf902845-7788-62ef-a309-2076568934790", name: "all-podcasts", file: "all-podcasts.html" },
    { id: "7f902565-8899-82ef-a409-207656b976789", name: "podcast-add", file: "podcast-add.html" },
    { id: "jf902565-9900-92ef-a509-8477909489044", name: "all-newsletters", file: "all-newsletters.html" },
    { id: "lf892565-1010-102ef-a609-7982793782905", name: "allPodcast", file: "allPodcast.html" },
    { id: "ff890939-1111-112ef-a709-2972442904933", name: "newsletter-detail", file: "newsletter-detail.html" },
    { id: "fhieu418-1122-122ef-a809-9494217183980", name: "khabarname-add", file: "khabarname-add.html" },
    { id: "gfdy738f-2233-132ef-a909-6781246587190", name: "khabarname", file: "khabarname.html" },
    { id: "ylhvipe2-3344-142ef-a1009-7459356678504", name: "bot", file: "bot.html" },
];

const getPage = (req, res) => {
    const { id, name } = req.params;

    const frog = frogs.find(
        c => c.id === id && c.name === decodeURIComponent(name)
    );

    if (!frog) {
        return res.status(404).sendFile(
            path.join(__dirname, "..", "public", "404page.html")
        );
    }

    res.sendFile(path.join(__dirname, "..", "public", frog.file.trim()));
};

module.exports = {
    getPage
}