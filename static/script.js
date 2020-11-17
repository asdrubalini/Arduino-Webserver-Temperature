const refreshPageContent = async() => {
    fetch("/")
        .then(response => {
            return response.text()
        })
        .then(html => {
            let parser = new DOMParser()
            let responseDocument = parser.parseFromString(html, 'text/html')
            let newTemperature = responseDocument.getElementById("info").innerText
            document.getElementById("info").innerText = newTemperature
        });
}

const proportion = function(value, in_min, in_max, out_min, out_max) {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
}

const parseTemperature = () => {
    const temperatureString = document.getElementById("info").innerText
    const temperature = parseFloat(temperatureString.split(" ")[0])
    return temperature
}

const setBackgroundColorFromTemperature = () => {
    const temperature = parseTemperature()
    const backgroundPositionPercentage = proportion(temperature, 23, 30, 0, 100)
    document.getElementsByClassName("rainbow")[0].style.backgroundPosition = `${backgroundPositionPercentage}%`
}

(function() {
    const reloadInterval = 1000;

    setBackgroundColorFromTemperature()

    setInterval(async() => {
        await refreshPageContent()
        setBackgroundColorFromTemperature()
    }, reloadInterval)
})()