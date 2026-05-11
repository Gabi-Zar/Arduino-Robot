#include <Arduino_RouterBridge.h>

void sendLog(String message) {
    Bridge.notify("sendLog", message);
}

void right() {
    sendLog("RIGHT");
}
void left() {
    sendLog("LEFT");
}
void forward() {
    sendLog("FORWARD");
}
void backward() {
    sendLog("BACKWARD");
}

void setup() {
    Bridge.begin();
    Bridge.provide_safe("go_right", right);
    Bridge.provide_safe("go_left", left);
    Bridge.provide_safe("go_forward", forward);
    Bridge.provide_safe("go_backward", backward);
    delay(10000); // wait for python to initialize
    sendLog("MCU ready");
}

void loop() {}