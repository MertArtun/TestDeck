#!/bin/bash

echo "🎨 TestDeck icon oluşturuluyor..."

cd /Volumes/Sandisk/AnkiAPP/src-tauri/icons

# Python ile basit PNG oluştur
python3 << 'EOF'
import base64

# 32x32 minimal PNG data (mavi arka plan, beyaz TD yazısı)
png_base64 = '''
iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAALQSURBVFiFrZdNbBNXEMd/XmzHdhInNE0aFKg/UqpWVaXSqhUXpB5aeuGAhASnnuiFE5e2XHrggpSTDy1wSA/9uLWVkEBI5VAJCQmHcoADUoUaVVWRGlqVtgGaJLaxZzu7M+8xb3fX9scGJI/07b6Zef/3npmdmRcAf2GappWmaUkI8V4Yho9d183CMIxlGPbPzCbmYCDacrKFUqrIsuzfUqn0Wy6X+71SqfwVhuFbOEX/B+DdGONMGIbvAPD1J73zY+7ey3e6u7tz/4mwtrb2rlKq/y4A7Du9h6cOf2bxD32rjcn81xM/vFEul3cM7N8CCAAgkUhkjTGPAQD0B8n0ePELbxQYenKTuMVPzNV3/nF28t+gKqXOhGH4JgAAWZYjy7LGHMf5NJlM5oQQnlarNV+tVr8FgGBwcPBDz/PeJYQ0NhPneV42Ho+/Dl8P/+M4zqWWlpa3mpubXzUt/VdJ+6YQEhJCPKWUvk8pHVEU5W7dtKZpH5VS6hCCf9ztpClFUTQnk8mThJAPCCGY53mX6TqO03Ec50EtgOd5r5qWfJQJ7Xme941hmJeGYfibkMI0zV9t2/4EAEBV1e16vf4gIeTDusmO4zoGgqkpRikdKxaLh3eW+/Hxcdu27Y8ppbcR8h/l8fFxG0KYzufzHwtBfz4wkH1SKBReKhQKO8oVi8WDEELbcRzDcZxFCOEFhNAGABBCa9O0GxDCawj9bwkhVxqNRvPB+7sv1/PNF/7oY4jhvMrp9/ZfmPrt6t4zXw8eJIRsR6NuZsO0bwAYGBgAhLCZiOj4xNzD4+PZb5UKe3pqZvYYAICiKBuWZZ1rNBr9tVNarQ7Gsp0/m0vvvrr66C4A6K7rngYA8H/Z0K4LpN7vc+7cuZPz3+P68sJCCL0hhJwBAEAIAYSQwzAMzwIATGHYLe9wOBxGrut+mct5n6TT6T2O4yyHYWjPvn8BZhEpOzI/dkIAAAAASUVORK5CYII=
'''

# PNG dosyasını oluştur
with open('icon.png', 'wb') as f:
    f.write(base64.b64decode(png_base64))

print("✅ icon.png oluşturuldu!")
EOF

echo "📝 Icon dosyası hazır!"
