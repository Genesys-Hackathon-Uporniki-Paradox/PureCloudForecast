fetch('https://ccforecast.herokuapp.com/')
    .then(
    function (response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
                response.status);
            return;
        }

        // Examine the text in the response
        response.json().then(function (data) {
            console.log(data);
            let paragraph = document.getElementById("data");
            paragraph.innerHTML = data.success;
        });
    }
    )
    .catch(function (err) {
        console.log('Fetch Error :-S', err);
    });