#include <Arduino_RouterBridge.h>

String direction = "";
int directionCooldownDefault = 2000;
int directionCooldown = directionCooldownDefault;

void sendLog(String message) {
    Bridge.notify("sendLog", message);
}

void right() {
    direction = "RIGHT";
}
void left() {
    direction = "LEFT";
}
void forward() {
    direction = "FORWARD";
}
void backward() {
    direction = "BACKWARD";
}

void setup() {
    Bridge.begin();
    Bridge.provide_safe("go_right", right);
    Bridge.provide_safe("go_left", left);
    Bridge.provide_safe("go_forward", forward);
    Bridge.provide_safe("go_backward", backward);

    pinMode(6, OUTPUT);
    pinMode(7, OUTPUT);
    pinMode(8, OUTPUT);
    pinMode(9, OUTPUT);

    delay(10000); // wait for python to initialize
    sendLog("MCU ready");
}

void loop() {
    if (directionCooldown <= 0) {
  	    activateMotors(0, 2);
        activateMotors(1, 2);
        directionCooldown = directionCooldownDefault;
        direction = "";
        sendLog("STOP");
        return;
    }
    else if(direction == "RIGHT") {
        activateMotors(0, 0);
        activateMotors(1, 0);
        sendLog("RIGHT");
    }
    else if(direction == "LEFT") {
  	    activateMotors(0, 1);
        activateMotors(1, 1);
        sendLog("LEFT");
    }
    else if(direction == "FORWARD") {
  	    activateMotors(0, 1);
        activateMotors(1, 0);
        sendLog("FORWARD");
    }
    else if(direction == "BACKWARD") {
  	    activateMotors(0, 0);
        activateMotors(1, 1);
        sendLog("BACKWARD");
    }
    directionCooldown -= 1;
}

void activateMotors(int motorNumber, int motorState) {
    const int MOTORSPINS[2][2] = {{6, 7}, {8, 9}}; // AIN1, AIN2, BIN1, BIN2

    if(motorState == 0) {
        digitalWrite(MOTORSPINS[motorNumber][0], 0);
        digitalWrite(MOTORSPINS[motorNumber][1], 1);
    }
    else if(motorState == 1) {
        digitalWrite(MOTORSPINS[motorNumber][0], 1);
        digitalWrite(MOTORSPINS[motorNumber][1], 0);
    }
    else if(motorState == 2) {
        digitalWrite(MOTORSPINS[motorNumber][0], 0);
        digitalWrite(MOTORSPINS[motorNumber][1], 0);
    }
}