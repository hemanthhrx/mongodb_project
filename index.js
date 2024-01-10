const express = require("express");
const path = require("path");
const app = express();
const LogInCollection = require("./mongodb");
const bcrypt = require("bcrypt");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, '../tempelates');
const publicPath = path.join(__dirname, '../public');

app.set('view engine', 'hbs');
app.set('views', templatePath);
app.use(express.static(publicPath));

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/signup', async (req, res) => {
    try {
        const checking = await LogInCollection.findOne({ name: req.body.name });

        if (checking) {
            res.send("User details already exist");
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const data = {
                name: req.body.name,
                password: hashedPassword
            };

            await LogInCollection.create(data);
            res.status(201).render("home", { naming: req.body.name });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await LogInCollection.findOne({ name: req.body.name });

        if (check) {
            const match = await bcrypt.compare(req.body.password, check.password);

            if (match) {
                res.status(201).render("home", { naming: `${req.body.password}+${req.body.name}` });
            } else {
                res.send("Incorrect password");
            }
        } else {
            res.send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log('Port connected');
});