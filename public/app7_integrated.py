"""
Modified Drowsiness Detection Script for SchoolBus Tracker Integration
=====================================================================

This script is a modified version of app7.py that sends drowsiness alerts
to the SchoolBus Tracker web application via API.

SETUP:
1. Install dependencies: pip install opencv-python torch torchvision pygame pillow requests
2. Place these files in the same directory:
   - haarcascade_frontalface_alt.xml
   - haarcascade_lefteye_2splits.xml
   - haarcascade_righteye_2splits.xml
   - cnnCat2.pth
   - alarm.wav
3. Update DRIVER_ID and BUS_ID below with actual UUIDs from your database
4. Update API_URL with your project URL
5. Run: python app7_integrated.py
"""

import os
import cv2
import torch
import numpy as np
import requests
import time
from pygame import mixer
from torchvision import transforms
from torch import nn
from PIL import Image

# ============== CONFIGURATION ==============
# Replace these with actual values from your database
DRIVER_ID = "YOUR_DRIVER_UUID_HERE"  # UUID of the driver from the drivers table
BUS_ID = "YOUR_BUS_UUID_HERE"        # UUID of the bus (optional, can be None)

# Your Lovable project API endpoint
API_URL = "https://bksqvvmpckprfpsgyvej.supabase.co/functions/v1/drowsiness-alert"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrc3F2dm1wY2twcmZwc2d5dmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDY2MzIsImV4cCI6MjA4NzU4MjYzMn0.4nrJhTueEuJ2xjLy2GTz9gY_xCTF1x2uy4IlFwnKeHc"

# How often to send alerts (in seconds) - don't flood the API
SEND_INTERVAL = 2
# ============================================


def send_alert(score, status, left_eye, right_eye):
    """Send drowsiness alert to the web application."""
    try:
        payload = {
            "driver_id": DRIVER_ID,
            "bus_id": BUS_ID if BUS_ID != "YOUR_BUS_UUID_HERE" else None,
            "score": score,
            "status": status,  # "normal", "warning", "alert"
            "left_eye": left_eye,  # "open" or "closed"
            "right_eye": right_eye,  # "open" or "closed"
        }
        headers = {
            "Content-Type": "application/json",
            "apikey": API_KEY,
            "Authorization": f"Bearer {API_KEY}",
        }
        response = requests.post(API_URL, json=payload, headers=headers, timeout=5)
        if response.status_code == 200:
            print(f"[API] Alert sent: {status} (score: {score})")
        else:
            print(f"[API] Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[API] Failed to send: {e}")


# Initialize pygame mixer for sound (optional)
try:
    mixer.init()
    sound = mixer.Sound('alarm.wav')
except Exception as e:
    sound = None

# Load Haar Cascade classifiers
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_alt.xml')
leye_cascade = cv2.CascadeClassifier('haarcascade_lefteye_2splits.xml')
reye_cascade = cv2.CascadeClassifier('haarcascade_righteye_2splits.xml')


# Define the model architecture
class EyeBlinkModel(nn.Module):
    def __init__(self):
        super(EyeBlinkModel, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 32, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout1 = nn.Dropout(0.25)
        self.dropout2 = nn.Dropout(0.5)
        self.fc1 = nn.Linear(64 * 3 * 3, 128)
        self.fc2 = nn.Linear(128, 4)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = self.pool(torch.relu(self.conv2(x)))
        x = self.pool(torch.relu(self.conv3(x)))
        x = torch.flatten(x, 1)
        x = self.dropout1(torch.relu(self.fc1(x)))
        x = self.dropout2(torch.relu(self.fc2(x)))
        return x


# Initialize model
model = EyeBlinkModel()
try:
    model.load_state_dict(torch.load('cnnCat2.pth', map_location='cpu', weights_only=True))
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

model.eval()

transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((24, 24)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5]),
])

cap = cv2.VideoCapture(0)
font = cv2.FONT_HERSHEY_COMPLEX_SMALL
score_count = 0
alarm_triggered = False
last_send_time = 0

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to capture image")
        break

    height, width = frame.shape[:2]
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5)

    cv2.rectangle(frame, (0, height - 50), (200, height), (0, 0, 0), thickness=cv2.FILLED)

    current_left_eye = "open"
    current_right_eye = "open"

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (100, 100, 100), 1)
        roi_gray_face = gray_frame[y:y + h, x:x + w]

        left_eye_coords = leye_cascade.detectMultiScale(roi_gray_face)
        right_eye_coords = reye_cascade.detectMultiScale(roi_gray_face)

        left_eye_closed = False
        right_eye_closed = False

        for (ex, ey, ew, eh) in left_eye_coords:
            l_eye_roi = roi_gray_face[ey:ey + eh, ex:ex + ew]
            l_eye_roi_pil = Image.fromarray(l_eye_roi)
            l_eye_roi_resized = transform(l_eye_roi_pil).unsqueeze(0)
            with torch.no_grad():
                lpred = model(l_eye_roi_resized)
                _, predicted = torch.max(lpred.data, 1)
                left_eye_closed = predicted.item() == 0
            break

        for (ex, ey, ew, eh) in right_eye_coords:
            r_eye_roi = roi_gray_face[ey:ey + eh, ex:ex + ew]
            r_eye_roi_pil = Image.fromarray(r_eye_roi)
            r_eye_roi_resized = transform(r_eye_roi_pil).unsqueeze(0)
            with torch.no_grad():
                rpred = model(r_eye_roi_resized)
                _, predicted = torch.max(rpred.data, 1)
                right_eye_closed = predicted.item() == 0
            break

        current_left_eye = "closed" if left_eye_closed else "open"
        current_right_eye = "closed" if right_eye_closed else "open"

        if left_eye_closed or right_eye_closed:
            score_count += 1
            if score_count >= 5 and not alarm_triggered:
                try:
                    if sound:
                        sound.play()
                        alarm_triggered = True
                except:
                    print("Sound alarm!")
        else:
            score_count -= max(1 / 30.0, score_count)
            alarm_triggered = False

        # Determine status
        if score_count >= 5:
            status = "alert"
        elif score_count >= 3:
            status = "warning"
        else:
            status = "normal"

        # Send to API at intervals
        current_time = time.time()
        if current_time - last_send_time >= SEND_INTERVAL:
            send_alert(score_count, status, current_left_eye, current_right_eye)
            last_send_time = current_time

        cv2.putText(frame, f'Score: {max(score_count, 0):.0f}', (10, height - 20), font, 1, (255, 255, 255), 1)
        cv2.putText(frame, f'Status: {status.upper()}', (10, 30), font, 1,
                    (0, 0, 255) if status == "alert" else (0, 255, 255) if status == "warning" else (0, 255, 0), 2)

    cv2.imshow('Drowsiness Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
