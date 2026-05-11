#include <Arduino_RouterBridge.h>

void sendLog(String message) {
  Bridge.notify("sendLog", message);
}

void setup() {
  Bridge.begin();
  delay(10000); // wait for python to initialize
  sendLog("MCU ready");
}

void loop() {

}