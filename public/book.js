async function booki() {

    var name = document.getElementById("name").value;
    var phone = document.getElementById("phone").value;
    var email = document.getElementById("email").value;
    var date = document.getElementById("date").value;
    var people = document.getElementById("no1").value;

    var response = await fetch("/booking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            phone: phone,
            email: email,
            date: date,
            people: people
        })
    });

    var message = await response.text();

    document.getElementById("booking").reset();

    document.getElementById("booking").style.display = "none";

    document.getElementById("head").style.display = "none";

    document.getElementById("message").innerHTML = message;
}