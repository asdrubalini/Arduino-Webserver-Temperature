const refreshPageContent = async() => {
    fetch("/")
        .then(response => {
            return response.text()
        })
        .then(html => {
            let parser = new DOMParser()
            let responseDocument = parser.parseFromString(html, 'text/html')
            let newTemperature = responseDocument.getElementById("temperature").innerText
            document.getElementById("temperature").innerText = newTemperature
        });
}

(function() {
    const reloadInterval = 500;

    setInterval(async() => {
        await refreshPageContent();
    }, reloadInterval)
})()