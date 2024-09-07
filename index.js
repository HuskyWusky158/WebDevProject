'use strict';

const express = require("express");
const app = express();
const PORT = 3000;
const nodemailer = require('nodemailer');

app.use(express.urlencoded({
    extended: true
}));

const checkOut = require('./products.js').products;

function productData(orderProduct){
    for (const singleItem of checkOut){
        if (singleItem.product == orderProduct){
            return singleItem
        }
    }
}

app.post("/order", (req, res) => {
    let person = req.body.fnameLname;
    let deliverTo = req.body.Address;
    const decision = productData(req.body.orderProduct);
    const product = decision.product;
    const company = decision.company;
    let amount = req.body.Quantity;
    let priceOfItem = decision.price;
    const totalPrice = amount * priceOfItem;
    let deliveryInstructions = req.body.yourInstructions;
    const totalPriceString =  totalPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'});

    res.send(`
    ${htmlTop}
    <h3>Thank you for ordering with us,<strong> ${person}!</strong></h3>
    <article>
    <p>You decided to purchase <strong>${amount}</strong> <strong>${product}</strong> from <strong>${company}</strong>.
    The price of a single <strong>${product}</strong> is <strong>$${priceOfItem}</strong>.</p>
    <p>The total cost for your order is <strong>${totalPriceString}</strong>.
    <p>Your order will be delivered to <strong>${deliverTo}</strong> with the following delivery instructions: <strong>${deliveryInstructions}</strong></p>
    </article>
    </section>
    ${htmlBottom}
    `)});
    
app.post("/results", (req, res) => {
    let name = req.body.fnameLname;
    let email = req.body.emailAddress;
    let feedback = req.body.howDidYouLearn;
    let visit = req.body.visit;
    let signMeUp = req.body.signMeUp;
    let coupons = req.body.coupons;
    let yourInput = req.body.yourInput
    const signUpChoices = [];
    const signUpChoicesEmail = [];

    signMeUp && signUpChoices.push("<strong>email updates</strong>");
    coupons && signUpChoices.push("<strong>coupons</strong>");
    
    signMeUp && signUpChoicesEmail.push("email updates");
    coupons && signUpChoicesEmail.push("coupons");

    
    res.send(`
    ${htmlTop}
    <h3>Hello, ${name}</h3>
    <article>
    <p>You let us know that you learned about us by <strong>${feedback}</strong>. Would you visit us again? <strong>${visit}</strong>.</p>
    <p>${(signMeUp || coupons) ? `You would like to receive: ${signUpChoices.join(" and ")}.` : ""}</p>
    <p>You left us the following comment: <strong>"${yourInput}."</strong> </p>
    <p>We can respond to you at: <strong>${email}</strong>.</p>
    </article>
    </section>
    ${htmlBottom}
    `);

    // Generate SMTP service account from ethereal.email
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            return process.exit(1);
        }
        console.log('Credentials obtained, sending message...');
        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user,
                pass: account.pass
            }
        });
        // Message 
        let message = {
            from: `Caitlin Bax <baxc@oregonstate.edu>`,
            to: `${name} <${email}>`,
            subject: 'Welcome from Caitlin Bax',
            text: `
            Hello, ${name}
            You let us know that you learned about us by ${feedback}. Would you visit us again? ${visit}.
            ${(signMeUp || coupons) ? `You would like to receive: ${signUpChoicesEmail.join(" and ")}.` : ""}
            You left us the following comment: "${yourInput}."
            `,
            html: `
            <h3>Hello, ${name}</h3>
            <p>You let us know that you learned about us by <strong>${feedback}</strong>. Would you visit us again? <strong>${visit}</strong>.</p>
            <p>${(signMeUp || coupons) ? `You would like to receive: ${signUpChoices.join(" and ")}.` : ""}</p>
            <p>You left us the following comment: <strong>"${yourInput}."</strong> </p>
            `
        };
        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});

let htmlTop = `
<!DOCTYPE html>
    <html lang= "eng">

    <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <title>Caitlin Bax</title>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <link rel='stylesheet' type='text/css' media='screen' href='main.css'>
        <script src='main.js'></script>
        <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="512x512" href="android-chrome-512x512.png">
        <link rel="icon" type="image/png" sizes="192x192" href="android-chrome-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
        <link rel="manifest" href="site.webmanifest">
        <link rel="stylesheet" href="main.css" />
    </head>

    <body>
        <header id="cactusHeader">

            <img src="android-chrome-192x192.png" alt="Black and white cactus" id="cactusLogo" />
            <h1>Caitlin Bax</h1>
        </header>
        <section>
        <nav class="global" id="globalPages">
            <a href="./index.html">Home</a>
            <a href="./contact.html">Contact</a>
            <a href="./gallery.html">Gallery</a>
            <a href="./order.html">Order</a>
        </nav>
        <main>
            `
let htmlBottom = `
    </main>
        <footer>
            <p>&copy; 2023 Caitlin Bax </p>
        </footer>
    </body>
    </html>
    `