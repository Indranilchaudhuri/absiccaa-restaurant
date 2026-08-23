import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// =========================
// MONGODB
// =========================

const client = new MongoClient(process.env.MONGODB_URI);

const database = client.db("absiccaa");
const bookings = database.collection("bookings");


// =========================
// BOOKING
// =========================

app.post("/booking", async (req, res) => {

    console.log("REQUEST RECEIVED");
    console.log(req.body);

    const { name, phone, email, date, people } = req.body;

    try {

        const booking = {
            name: name,
            phone: phone,
            email: email,
            date: date,
            people: people,
            status: "PENDING",
            paymentStatus: "NOT PAID",
            createdAt: new Date()
        };

        const result = await bookings.insertOne(booking);

        console.log("BOOKING SAVED");
        console.log("Booking ID:", result.insertedId);

        res.send("Booking request received. Please wait for confirmation.");

    } catch (error) {

        console.log("DATABASE ERROR");
        console.log(error);

        res.status(500).send("Booking could not be saved.");

    }

});


// =========================
// ADMIN - GET BOOKINGS
// =========================

app.get("/admin/bookings", async (req, res) => {

    try {

        const data = await bookings
            .find({ status: "PENDING" })
            .toArray();

        res.json(data);

    } catch (error) {

        console.log("ADMIN BOOKINGS ERROR");
        console.log(error);

        res.status(500).send("Could not load bookings.");

    }

});


// =========================
// SEND EMAIL USING BREVO
// =========================

async function sendEmail(booking) {

    const response = await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
            method: "POST",

            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json"
            },

            body: JSON.stringify({

                sender: {
                    name: "Absiccaa Restaurant",
                    email: process.env.EMAIL_USER
                },

                to: [
                    {
                        email: booking.email,
                        name: booking.name
                    }
                ],

                subject: "Table Available - Absiccaa",

                htmlContent: `
                    <h2>Your table is available</h2>

                    <p>Hello ${booking.name},</p>

                    <p>
                        Your table is available for your requested booking.
                    </p>

                    <p>
                        <b>Date:</b> ${booking.date}
                    </p>

                    <p>
                        <b>Number of people:</b> ${booking.people}
                    </p>

                    <p>
                        <b>Phone:</b> ${booking.phone}
                    </p>

                    <p>
                        Thank you for choosing Absiccaa Restaurant.
                    </p>
                `

            })

        }
    );

    const data = await response.json();

    if (!response.ok) {

        console.log("BREVO EMAIL ERROR");
        console.log(data);

        throw new Error(data.message || "Brevo email failed");

    }

    console.log("AVAILABLE EMAIL SENT");
    console.log("BREVO RESPONSE:", data);

}


// =========================
// ADMIN - UPDATE BOOKING
// =========================

app.put("/admin/booking/:id", async (req, res) => {

    try {

        const { ObjectId } = await import("mongodb");

        const id = new ObjectId(req.params.id);

        const status = req.body.status;

        const booking = await bookings.findOne({
            _id: id
        });

        if (!booking) {

            return res
                .status(404)
                .send("Booking not found.");

        }


        // =========================
        // AVAILABLE
        // =========================

        if (status === "AVAILABLE") {

            await bookings.updateOne(
                { _id: id },

                {
                    $set: {
                        status: "AVAILABLE"
                    }
                }
            );

            await sendEmail(booking);

            return res.send(
                "Booking marked AVAILABLE and email sent."
            );

        }


        // =========================
        // NOT AVAILABLE
        // =========================

        if (status === "NOT AVAILABLE") {

            await bookings.updateOne(
                { _id: id },

                {
                    $set: {
                        status: "NOT AVAILABLE"
                    }
                }
            );

            console.log(
                "BOOKING MARKED NOT AVAILABLE"
            );

            return res.send(
                "Booking marked NOT AVAILABLE."
            );

        }


        // =========================
        // INVALID STATUS
        // =========================

        return res
            .status(400)
            .send("Invalid booking status.");

    }

    catch (error) {

        console.log("ADMIN ERROR");
        console.log(error);

        res
            .status(500)
            .send("Could not update booking.");

    }

});


// =========================
// MAIN WEBSITE
// =========================

app.get("/", (req, res) => {

    res.sendFile(
        process.cwd() + "/public/res.html"
    );

});


// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running on port ${PORT}`
    );

});