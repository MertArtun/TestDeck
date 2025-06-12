#!/bin/bash

echo "🎨 Minimal icon oluşturuluyor..."

cd /Volumes/Sandisk/AnkiAPP/src-tauri/icons

# Basit 32x32 PNG oluştur (hex format)
python3 << 'EOF'
import struct

# Minimal 32x32 mavi PNG
def create_minimal_png():
    # PNG header
    png_signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk (32x32, 8-bit RGB)
    ihdr_data = struct.pack('>2I5B', 32, 32, 8, 2, 0, 0, 0)
    ihdr_crc = 0x91f0d76d  # Pre-calculated CRC for this IHDR
    ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # Minimal IDAT chunk (compressed empty image data)
    idat_data = b'\x78\x9c\x63\x00\x01\x00\x00\x05\x00\x01'
    idat_crc = 0x0a76c8ac  # Pre-calculated CRC
    idat_chunk = struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', 0xae426082)
    
    return png_signature + ihdr_chunk + idat_chunk + iend_chunk

# Create and save minimal PNG
with open('icon.png', 'wb') as f:
    f.write(create_minimal_png())

print("✅ Minimal icon.png oluşturuldu!")
EOF
