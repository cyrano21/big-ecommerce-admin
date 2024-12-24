from PIL import Image, ImageDraw, ImageFont
import os

# Créer une image de base
width, height = 200, 200
image = Image.new('RGB', (width, height), color='white')

# Créer un objet de dessin
draw = ImageDraw.Draw(image)

# Charger une police
try:
    font = ImageFont.truetype("arial.ttf", 80)
except IOError:
    font = ImageFont.load_default()

# Dessiner le texte "store"
text = "store"
bbox = draw.textbbox((0, 0), text, font=font)
textwidth = bbox[2] - bbox[0]
textheight = bbox[3] - bbox[1]
x = (width - textwidth) / 2
y = (height - textheight) / 2
draw.text((x, y), text, fill='black', font=font)

# Ajouter un contour
draw.rectangle([0, 0, width-1, height-1], outline='black', width=5)

# Sauvegarder l'image
image.save('K:/big-ecommerce-admin-main/public/logo.png')

print("Logo créé avec succès !")
