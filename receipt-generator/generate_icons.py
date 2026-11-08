from PIL import Image
import os

public_dir = r"c:\Users\DELL USER\Desktop\Receipt_Solv\receipt-generator\public"
logo_path = os.path.join(public_dir, "webbishop_logo.png")

logo = Image.open(logo_path).convert("RGBA")

# Function to create square icon with padding
def make_square_icon(size, out_name):
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    # resize logo keeping aspect ratio
    padding = int(size * 0.15)
    target_size = size - (padding * 2)
    logo_copy = logo.copy()
    logo_copy.thumbnail((target_size, target_size), Image.Resampling.LANCZOS)
    
    # center on canvas
    x = (size - logo_copy.width) // 2
    y = (size - logo_copy.height) // 2
    canvas.paste(logo_copy, (x, y), logo_copy)
    
    out_path = os.path.join(public_dir, out_name)
    canvas.save(out_path, "PNG")
    print(f"Generated {out_name} ({size}x{size})")

make_square_icon(192, "pwa-192x192.png")
make_square_icon(512, "pwa-512x512.png")
make_square_icon(180, "apple-touch-icon.png")
make_square_icon(180, "favicon.png")
