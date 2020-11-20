#include <SPI.h>
#include <Ethernet.h>

#define HTTP_PORT 80
#define SENSOR_PIN A5

EthernetServer server(HTTP_PORT); // Create server object

// LAN configuration
byte mac[] = {0xDE, 0xAA, 0xAB, 0xA3, 0xB5, 0x18};
IPAddress gateway(10, 0, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress ip(10, 0, 0, 64);

void setup()
{
    // Start to listen on specified port
    Ethernet.begin(mac, ip, gateway, subnet);
    server.begin();
    Serial.begin(9600);
}

struct Temperature
{
    double celsius;
    double fahrenheit;
    double kelvin;
    int raw;
};

struct Temperature readAnalogTemperature()
{
    // Read celsius temperature from sensor

    Temperature t;

    t.raw = analogRead(SENSOR_PIN);
    double sensorMilliVolt = t.raw * 4.88;
    t.celsius = sensorMilliVolt / 10;
    t.fahrenheit = (t.celsius * 9 / 5) + 32.0;
    t.kelvin = t.celsius + 273.15;

    return t;
}

void makeHTTPResponse(EthernetClient thisClient)
{
    // Headers
    thisClient.print("HTTP/1.1 200 OK\n");
    thisClient.print("Content-Type: text/html\n\n");

    Temperature t = readAnalogTemperature();

    String strCelsius = String(t.celsius);
    String strFahrenheit = String(t.fahrenheit);
    String strKelvin = String(t.kelvin);

    String strMilliVolts = String(t.raw * 4.88);

    // Define a template for the request.
    // Values will be included in the string later by sprintf
    const char *HTMLBodyTemplate =
        "<html>"
        "<head>"
        "<title>Temperatura stanza</title>"
        "<link rel=\"stylesheet\" href=\"style.css\">"
        "</head>"
        "<body class=\"rainbow\">"
        "<div class=\"container\">"
        "<h1>Temperatura registrata:</h1>"
        "<h1 id=\"info_celsius\">%s &deg;C (%s mV)</h1>"
        "<h1 id=\"info_other\">%s &deg;F %s K</h1>"
        "</div>"
        "<script src=\"script.js\"></script>"
        "</body>"
        "</html>";

    // Allocate actual HTTP response body with data
    char *finalResponse = (char *)malloc(strlen(HTMLBodyTemplate) * sizeof(char));
    sprintf(finalResponse, HTMLBodyTemplate, strCelsius.c_str(),
            strMilliVolts.c_str(), strFahrenheit.c_str(), strKelvin.c_str());

    // Finally, send the complete HTTP response
    thisClient.println(finalResponse);

    free(finalResponse); // Free response string from memory
}

void loop()
{
    // Get client object that will be used to send back an HTTP response
    EthernetClient client = server.available();

    // If there are no clients waiting for response, restart loop
    if (!client)
        return;

    // Create and send response back to the client
    makeHTTPResponse(client);
    // close the connection:
    client.stop();
}
