const temperatureEmojiThreshold = 26.8

const minTemperature = 23
const maxTemperature = 35

const reloadInterval = 1000
const emojiInterval = 300

const hotImagePath = "fire.png"
const coldImagePath = "cold.png"

let latestEmoji = null

const refreshPageContent = async() => {
    fetch("/")
        .then(response => {
            return response.text()
        })
        .then(html => {
            let parser = new DOMParser()
            let responseDocument = parser.parseFromString(html, 'text/html')
            let newTemperatureCelsius = responseDocument.getElementById("info_celsius").innerText
            let newTemperatureOther = responseDocument.getElementById("info_other").innerText

            document.getElementById("info_celsius").innerText = newTemperatureCelsius
            document.getElementById("info_other").innerText = newTemperatureOther
        });
}

const proportion = function(value, in_min, in_max, out_min, out_max) {
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
}

const parseTemperature = () => {
    const temperatureString = document.getElementById("info_celsius").innerText
    const temperature = parseFloat(temperatureString.split(" ")[0])
    return temperature
}

const setBackgroundColorFromTemperature = () => {
    const temperature = parseTemperature()
    const backgroundPositionPercentage = proportion(temperature, minTemperature, maxTemperature, 0, 100)
    document.getElementsByClassName("rainbow")[0].style.backgroundPosition = `${backgroundPositionPercentage}%`
}

const getCurrentEmojiFromTemperature = () => {
    currentEmoji = parseTemperature() > temperatureEmojiThreshold ? hotImagePath : coldImagePath

    if (latestEmoji === null) {
        latestEmoji = currentEmoji
    }

    if (currentEmoji !== latestEmoji) {
        // Emoji change detected, update all existing emojis
        for (let emoji in document.getElementsByClassName("emoji")) {
            console.log("updating emojis")
            emoji["src"] = currentEmoji
        }

        latestEmoji = currentEmoji
    }

    return currentEmoji
}

function generatePosition() {
    const x = Math.round((Math.random() * 100) - 10) + '%';
    const y = Math.round(Math.random() * 100) - 15 + '%';
    return [x, y];
}

function generateEmojis() {
    const emoji = document.createElement("img")
    const position = generatePosition()

    emoji.classList.add("emoji")

    emoji["src"] = getCurrentEmojiFromTemperature()
    emoji.style.top = position[0]
    emoji.style.left = position[1]

    document.body.appendChild(emoji)

    setTimeout(() => {
        emoji.style.opacity = '1'
        emoji.classList.add('generated')
    }, 100)

    setTimeout(() => {
        emoji.parentElement.removeChild(emoji)
    }, 2000)
}


(function() {
    // Prevent users from clicking
    const topPanel = document.createElement("div")
    topPanel.classList.add("top-panel")
    document.body.insertBefore(topPanel, document.getElementsByClassName("container")[0])

    setBackgroundColorFromTemperature()

    setInterval(generateEmojis, emojiInterval);
    generateEmojis();

    setInterval(async() => {
        await refreshPageContent()
        setBackgroundColorFromTemperature()
    }, reloadInterval)
})()