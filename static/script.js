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
    const backgroundPositionPercentage = proportion(temperature, 23, 32, 0, 100)
    document.getElementsByClassName("rainbow")[0].style.backgroundPosition = `${backgroundPositionPercentage}%`
}

let lastEmoji = null

const getCurrentEmojiFromTemperature = () => {
    currentEmoji = parseTemperature() > 26.0 ? 'fire.png' : 'cold.png'

    if (lastEmoji === null) {
        lastEmoji = currentEmoji
    }

    if (currentEmoji !== lastEmoji) {
        // Emoji change detected, update all existing emojis
        for (let emoji in document.getElementsByClassName("emoji")) {
            console.log("updating emojis")
            emoji["src"] = currentEmoji
        }

        lastEmoji = currentEmoji
    }

    return currentEmoji
}

function generatePosition() {
    const x = Math.round((Math.random() * 100) - 10) + '%';
    const y = Math.round(Math.random() * 100) + '%';
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
    const reloadInterval = 1000
    const emojiInterval = 400

    setBackgroundColorFromTemperature()

    setInterval(generateEmojis, emojiInterval);
    generateEmojis();

    setInterval(async() => {
        await refreshPageContent()
        setBackgroundColorFromTemperature()
    }, reloadInterval)
})()