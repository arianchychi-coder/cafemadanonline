const path = require("node:path")
const {v4 : uuid} = require("uuid")

const frogs = [
    { id: "1d2b2b3e-4e55-4f5c-a31d-111111111111", name: "admin", file: "login (1).html" },
];

const getAdminPage = (req, res) => {
    const frog = frogs.find(f => f.name === "admin");

    if (!frog) {
        return res.status(404).send("Page not found");
    }

    res.sendFile(path.join(__dirname, "..", "public", frog.file.trim()));
};

module.exports = {
    getAdminPage
}