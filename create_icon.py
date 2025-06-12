#!/usr/bin/env python3

try:
    from PIL import Image, ImageDraw, ImageFont
    
    # 32x32 basit icon oluştur
    img = Image.new('RGB', (32, 32), color='#3b82f6')
    draw = ImageDraw.Draw(img)
    
    # Beyaz kare ekle
    draw.rectangle([8, 8, 24, 24], fill='white')
    
    # TD yazısı ekle
    try:
        font = ImageFont.load_default()
        draw.text((12, 12), "TD", fill='#3b82f6', font=font)
    except:
        draw.text((12, 12), "TD", fill='#3b82f6')
    
    # Kaydet
    img.save('/Volumes/Sandisk/AnkiAPP/src-tauri/icons/icon.png')
    print("✅ Icon başarıyla oluşturuldu!")
    
except ImportError:
    print("❌ PIL modülü bulunamadı. Manuel olarak icon oluşturuluyor...")
    
    # Base64 encoded minimal PNG (32x32 mavi icon)
    import base64
    
    # Minimal PNG data (32x32 mavi kare)
    png_data = base64.b64decode('''
iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAF5JREF
UWIXt1jEKACAMAMGo/f+X7aCDYGuhg5uy3CWQsL1ckkbCN8wwhDdgwY5F+fKTAIABAwYMGDBgwI
ABAIABAwYMGDBgwIABAwYAAAYMGDBgwIABAwYMGDAAQAH8AAEB35RKgAACZUlEQVR4nGXTQQ6CMB
CF4Z8QQnI4WFhOQ0/TW+ZVlRAQ+O8l7SStFmP8klZKv5lJWdJnhm5dh9M0TR4mSbrv95kAACA+
zzOT5Hl+yTl/VUpl9/0+893X/X4z2bZtmS9JkjSapklzlWXZ8zzP1hjzDmCT4H/CgIE1VUUAAAA
ASUVORK5CYII=
''')
    
    with open('/Volumes/Sandisk/AnkiAPP/src-tauri/icons/icon.png', 'wb') as f:
        f.write(png_data)
    
    print("✅ Minimal icon oluşturuldu!")
