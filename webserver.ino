#include <SPI.h>
#include <Ethernet.h>

#define HTTP_PORT 80
#define SENSOR_PIN A5

EthernetServer server(HTTP_PORT); // Create server object

// LAN configuration
byte mac[] = { 0xDE, 0xAA, 0xAB, 0xA3, 0xB5, 0x18 };
IPAddress gateway(10, 0, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress ip(10, 0, 0, 64);

void setup() {
  // Start to listen on specified port
  Ethernet.begin(mac, ip, gateway, subnet);
  server.begin();
  Serial.begin(9600);
}

struct temperature {
  double celsius;
  int raw;
};

struct temperature readAnalogTemperature() {
  // Read celsius temperature from sensor

  temperature t;
  
  t.raw = analogRead(SENSOR_PIN);
  double sensorMilliVolt = t.raw * 4.88;
  t.celsius = sensorMilliVolt / 10;
  
  return t;
}

void makeResponse(EthernetClient thisClient) {
  // Make an HTTP response and send it back to the client
  thisClient.print("HTTP/1.1 200 OK\n");
  thisClient.print("Content-Type: text/html\n\n");

  temperature t = readAnalogTemperature();
  
  char strCelsius[6];
  dtostrf(t.celsius, 4, 2, strCelsius);

  // Define a template for the request.
  // Values will be included in the string later
  const char *HTMLBodyTemplate =
    "<html>"
    "<head>"
    "<title>Temperatura stanza</title>"
    "<link rel=\"stylesheet\" href=\"//elegant-visvesvaraya-8ae3a2.netlify.app/style.css\">"
    "</head>"
    "<body class=\"rainbow\">"
    "<div class=\"container\">"
    "<h1>Temperatura registrata:</h1>"
    "<h1 id=\"temperature\">%s °C (%d / 1024)</h1>"
    "</div>"
    "<script src=\"//elegant-visvesvaraya-8ae3a2.netlify.app/script.js\"></script>"
    "</body>"
    "</html>";

  char *finalResponse = (char*) malloc(strlen(HTMLBodyTemplate) * sizeof(char));
  sprintf(finalResponse, HTMLBodyTemplate, strCelsius, t.raw);

  // Finally, send the complete HTTP response
  thisClient.println(finalResponse);

  free(finalResponse); // Free response string from memory
}

void loop() {
  // Get client object that will be used to send back an HTTP response
  EthernetClient client = server.available();

  if (client) { // If no client has data available for reading, this object will evaluate to false in an if-statement
    // Useful debug print
    //    Serial.print("Got a client: ");
    //    Serial.println(millis());
    //    Ethernet.begin(mac, ip, gateway, subnet);
    //    server.begin();

    int endString = 0; // In this scope is used as a marker to find the end of connection.
    //It permits the makeresponse() call only when the client
    //object have two recursive endline character (\r\n or \n\n)
    //that indicate the end of connection.
    int endBuffer = 0; //a marker to exit from reading buffer
    while (client.connected() && endBuffer == 0) { //a client is considered connected if the connection has been closed but there is still unread data
      if (client.available()) { //Returns the number of bytes, in the client buffer, available for reading
        char thisChar = client.read(); //every reading delete a character from the buffer
        //if you get a linefeed and the request line is blank,
        //then the request is over:
        if (thisChar == '\n' && endString == 1) { //if the \n character arrives after a \n or \r, endString
          //will be 0
          endBuffer = 1; //exit from while loop
        }

        if (endBuffer == 0) { //if the Buffer is not empty
          //if you get a newline of carriage return,
          //you're at the end of a line:
          if (thisChar == '\n' || thisChar == '\r') {
            endString = 1; //at the first character \n or \r endString is set to 1
          } else endString = 0;
        } //end if endBuffer
      } //end if clientAvailable
    } // end while

    // Create and send response back to the client
    makeResponse(client);
    //give the web browser time to receive the data
    //    delay(100);
    //close the connection:
    client.stop();

  }

}
