#include <Arduino_RouterBridge.h>
#include <Servo.h>

const int directionCooldownDefault = 10000;
const int IR_GAUCHE = 7;
const int IR_DROIT  = 6;

String direction = "";
String latestLog = "";
int directionCooldown = directionCooldownDefault;

Servo servo1;  // op / fp
Servo servo2;  // lp / bp
Servo servo3;  // lb / bb
Servo servo4;  // gb / db

int pos1 = 90;
int pos2 = 90;
int pos3 = 90;
int pos4 = 90;

bool isAutoPiloteActivated = false;


void sendLog(String message) {
    if (message == latestLog) {
        return;
    }
    latestLog = message;
    Bridge.notify("sendLog", message);
}

void right() {
    direction = "RIGHT";
    directionCooldown = directionCooldownDefault;
}
void left() {
    direction = "LEFT";
    directionCooldown = directionCooldownDefault;
}
void forward() {
    direction = "FORWARD";
    directionCooldown = directionCooldownDefault;
}
void backward() {
    direction = "BACKWARD";
    directionCooldown = directionCooldownDefault;
}
void stop() {
    direction = "STOP";
    directionCooldown = directionCooldownDefault;
}


void activateMotors(int motorNumber, int motorState) {
    const int MOTORSPINS[2][2] = {{6, 7}, {8, 9}}; // BIN2, BIN1, AIN2, AIN1

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

int clamp(int val) {
  if (val < 0)   return 0;
  if (val > 180) return 180;
  return val;
}

// =============================================
// Servo 1 — op et fp
// =============================================
void op() {
  pos1 = clamp(pos1 + 5);
  servo1.write(pos1);
  sendLog("op → Servo1 : "); sendLog(String(pos1));
}

void fp() {
  pos1 = clamp(pos1 - 5);
  servo1.write(pos1);
  sendLog("fp → Servo1 : "); sendLog(String(pos1));
}

// =============================================
// Servo 2 — lp et bp
// =============================================
void lp() {
  pos2 = clamp(pos2 + 5);
  servo2.write(pos2);
  sendLog("lp → Servo2 : "); sendLog(String(pos2));
}

void bp() {
  pos2 = clamp(pos2 - 5);
  servo2.write(pos2);
  sendLog("bp → Servo2 : "); sendLog(String(pos2));
}

// =============================================
// Servo 3 — lb et bb
// =============================================
void lb() {
  pos3 = clamp(pos3 + 5);
  servo3.write(pos3);
  sendLog("lb → Servo3 : "); sendLog(String(pos3));
}

void bb() {
  pos3 = clamp(pos3 - 5);
  servo3.write(pos3);
  sendLog("bb → Servo3 : "); sendLog(String(pos3));
}

// =============================================
// Servo 4 — gb et db
// =============================================
void gb() {
  pos4 = clamp(pos4 + 5);
  servo4.write(pos4);
  sendLog("gb → Servo4 : "); sendLog(String(pos4));
}

void db() {
  pos4 = clamp(pos4 - 5);
  servo4.write(pos4);
  sendLog("db → Servo4 : "); sendLog(String(pos4));
}

void toggleAutoPilote() {
    isAutoPiloteActivated = !isAutoPiloteActivated;
}

void setup() {
    Bridge.begin();
    Bridge.provide_safe("go_right", right);
    Bridge.provide_safe("go_left", left);
    Bridge.provide_safe("go_forward", forward);
    Bridge.provide_safe("go_backward", backward);
    Bridge.provide_safe("stop", stop);
    Bridge.provide_safe("op", op); // ouvrir pince
    Bridge.provide_safe("fp", fp); // fermer pince 
    Bridge.provide_safe("lp", lp); // lever pince
    Bridge.provide_safe("bp", bp); // bas pince
    Bridge.provide_safe("lb", lb); // lever bras
    Bridge.provide_safe("bb", bb); // bas bras
    Bridge.provide_safe("gb", gb); // gauche bras
    Bridge.provide_safe("db", db); // droite bras
    Bridge.provide_safe("toggle_auto_pilote", toggleAutoPilote);

    pinMode(6, OUTPUT);
    pinMode(7, OUTPUT);
    pinMode(8, OUTPUT);
    pinMode(9, OUTPUT);

    servo1.attach(2);
    servo2.attach(3);
    servo3.attach(4);
    servo4.attach(5);

    servo1.write(pos1);
    servo2.write(pos2);
    servo3.write(pos3);
    servo4.write(pos4);

    pinMode(IR_GAUCHE, INPUT);
    pinMode(IR_DROIT,  INPUT);

    delay(10000); // wait for python to initialize
    sendLog("MCU ready");
}

void loop() {
    if (isAutoPiloteActivated) {
        int captGauche = digitalRead(IR_GAUCHE);
        int captDroit  = digitalRead(IR_DROIT);

        if (captGauche == HIGH && captDroit == HIGH) {
            forward();

        } else if (captGauche == LOW && captDroit == HIGH) {
            right();

        } else if (captGauche == HIGH && captDroit == LOW) {
            left();

        } else {
            stop();
        }
    }

    if (directionCooldown <= 0 || direction == "STOP") {
  	    activateMotors(0, 2);
        activateMotors(1, 2);
        directionCooldown = directionCooldownDefault;
        direction = "STOP";
        sendLog("STOP");
        return;
    }
    else if(direction == "RIGHT") {
        activateMotors(0, 1);
        activateMotors(1, 1);
        sendLog("RIGHT");
    }
    else if(direction == "LEFT") {
  	    activateMotors(0, 0);
        activateMotors(1, 0);
        sendLog("LEFT");
    }
    else if(direction == "FORWARD") {
  	    activateMotors(0, 0);
        activateMotors(1, 1);
        sendLog("FORWARD");
    }
    else if(direction == "BACKWARD") {
  	    activateMotors(0, 1);
        activateMotors(1, 0);
        sendLog("BACKWARD");
    }
    directionCooldown -= 1;
}