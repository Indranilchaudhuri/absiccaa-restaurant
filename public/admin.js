async function loadBookings() {

    const response = await fetch("/admin/bookings");

    const bookings = await response.json();

    const container = document.getElementById("bookings");

    container.innerHTML = "";

    bookings.forEach(booking => {

        const div = document.createElement("div");

        div.innerHTML = `
            <hr>

            <p><b>Name:</b> ${booking.name}</p>
            <p><b>Phone:</b> ${booking.phone}</p>
            <p><b>Email:</b> ${booking.email}</p>
            <p><b>Date:</b> ${booking.date}</p>
            <p><b>People:</b> ${booking.people}</p>
            <p><b>Status:</b> ${booking.status}</p>

            <button onclick="updateBooking('${booking._id}', 'AVAILABLE')">
                AVAILABLE
            </button>

            <button onclick="updateBooking('${booking._id}', 'NOT AVAILABLE')">
                NOT AVAILABLE
            </button>

            <hr>
        `;

        container.appendChild(div);
    });
}


async function updateBooking(id, status) {

    const response = await fetch("/admin/booking/" + id, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            status: status
        })
    });

    const message = await response.text();

    alert(message);

    loadBookings();
}


loadBookings();