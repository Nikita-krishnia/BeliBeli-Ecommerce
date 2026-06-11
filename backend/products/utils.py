import json
from PIL import Image
from sentence_transformers import SentenceTransformer
from .models import Product

print("Loading CLIP Vision AI Model... ")
model = SentenceTransformer('clip-ViT-B-32')
print("CLIP Model Loaded successfully!")

def generate_catalog_vectors():
    """
    Loops through all products, processes their images through CLIP,
    and updates their image_vector fields in the database.
    """
    products = Product.objects.all()
    updated_count = 0

    for p in products:
        if p.image:
            try:
                # 1. Open the image using Pillow from its file path
                img_path = p.image.path
                img = Image.open(img_path)

                # 2. Encode the image into a mathematical vector fingerprint
                vector = model.encode(img)

                # 3. Convert the numpy vector list into a JSON string to store in standard SQL text fields
                vector_list = vector.tolist()
                p.image_vector = json.dumps(vector_list)
                p.save()
                
                print(f" Generated vector fingerprint for: {p.title}")
                updated_count += 1
            except Exception as e:
                print(f" Failed to process image for {p.title}: {str(e)}")
        else:
            print(f"Skipping {p.title} - No image attached.")

    print(f"\nComplete! Successfully indexed {updated_count} product vector configurations.")