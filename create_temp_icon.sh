#!/bin/bash

echo "🎨 TestDeck için geçici icon oluşturuluyor..."

# macOS'ta sips komutu ile basit bir icon oluştur
cd /Volumes/Sandisk/AnkiAPP/src-tauri/icons

# 32x32 basit icon (base64 encoded minimal PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVFiFrZdNbBNXEMd/781a61iOE6I2IQHihKgqlVBVqVWrXlpVvfTSS3vpqZe2Ej31kkNPPfXWE5JyKoceekoP7QFOPVSqeqAqVKXio5U+UEMTkmATcIKdOHa832s/D97d9QcJKOzBu28z850/MzP7ZoaC/wFmZ2eLhmFsJISsZ4yVOOdZIYS3k5QS3/fNtm1jHMeXiqLw5ubm4/+FIAAAGY1Gp40x32utczK/tm0/uHnz5l/Ah5+KO51Op4QQa621K3y7rut45cqVz1fcdru9QgixlrUODw8/+gAAAKampj6VUn4jhDg05Zw3b968fP/+/Y8+EQCAKIqyUso/PgAAgG3bt1zX/QYAmJqa+lIIcfRpGON8a2sLk5OT8H0fQgjkcrkhcC0vL79er9e/flKpWq127+rVq1lrbaHX6w1gKWWJc35ASJHpdu0+Iju8EgAIIZBKpdDr9RAEwZCG8DkiKoriq3a7PfAopHREUXT37t27HyilDnLOJwkhvN/v36/Vat8BUBrz2/+I67pzQohnP/F7vV6t1+sl/PFRN3zIGGuGcby53W6nFldaWlrKSCnfnZ+f3xgVhRDCWblyZR8AULOjj0+8AAL4WZ4UhVEUrRNRCCE8APiDCJY1AGClW0CAoihKmCJhwO/3+3sA4OU=" | base64 -d > icon.png

echo "✅ Geçici icon oluşturuldu!"
