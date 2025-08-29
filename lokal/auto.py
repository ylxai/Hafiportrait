import os
import time
import requests
import boto3
from dotenv import load_dotenv
from PIL import Image, ImageOps, ImageFile
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import urllib3

# Import modal client yang robust
from modal_client import ModalEnhanceClient, enhance_image_robust

# Disable SSL warnings for problematic connections
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# -------- CONFIG --------
load_dotenv()

R2_BUCKET   = os.getenv("CLOUDFLARE_R2_BUCKET_NAME")
R2_ENDPOINT = os.getenv("CLOUDFLARE_R2_ENDPOINT")
R2_AK       = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID")
R2_SK       = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
PUBLIC_DOMAIN = "https://photos.hafiportrait.photography"

# Modal FastAPI endpoint root
MODAL_API = "https://khzmh--swinir-enhance-fastapi-app.modal.run"

INPUT_DIR = "input"
BACKUP_DIR = "backup"
RAW_BACKUP_DIR = "backup/raw"  # Folder khusus untuk RAW files
JPG_BACKUP_DIR = "backup/jpg"  # Folder khusus untuk JPG files
WORK_DIR = "work"
ENHANCED_DIR = "enhanced"

for d in [INPUT_DIR, BACKUP_DIR, RAW_BACKUP_DIR, JPG_BACKUP_DIR, WORK_DIR, ENHANCED_DIR]:
    os.makedirs(d, exist_ok=True)

ImageFile.LOAD_TRUNCATED_IMAGES = True

# -------- INIT R2 --------
s3 = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_AK,
    aws_secret_access_key=R2_SK,
    region_name="auto"
)

COUNTER_FILE = ".counter.txt"

def load_counter():
    if os.path.exists(COUNTER_FILE):
        try:
            return int(open(COUNTER_FILE).read().strip())
        except:
            return 1
    return 1

def save_counter(n):
    with open(COUNTER_FILE, "w") as f:
        f.write(str(n))

# -------- UTILS --------
def wait_until_complete(path, checks=3, interval=0.5):
    last_size = -1
    stable_count = 0
    for _ in range(20):
        try:
            size = os.path.getsize(path)
        except FileNotFoundError:
            size = 0
        if size == last_size and size > 0:
            stable_count += 1
            if stable_count >= checks:
                return True
        else:
            stable_count = 0
            last_size = size
        time.sleep(interval)
    return False

def safe_open_image(path, retries=5):
    for i in range(retries):
        try:
            img = Image.open(path)
            img.load()
            return img
        except Exception as e:
            print(f"⏳ File belum siap {os.path.basename(path)}, retry {i+1}/{retries}: {e}")
            time.sleep(0.5)
    raise RuntimeError(f"Gagal membuka gambar setelah {retries}x percobaan: {os.path.basename(path)}")

def detect_orientation_and_resize(img: Image.Image) -> Image.Image:
    """
    Auto-detect portrait/landscape dan resize sesuai orientasi
    Portrait: 1500x2100 (5x7 inch)
    Landscape: 2100x1500 (7x5 inch)
    """
    width, height = img.size

    if height > width:
        # Portrait orientation
        target_size = (1500, 2100)
        orientation = "Portrait"
    else:
        # Landscape orientation
        target_size = (2100, 1500)
        orientation = "Landscape"

    print(f"📐 Detected: {orientation} ({width}x{height} → {target_size[0]}x{target_size[1]})")
    return ImageOps.fit(img, target_size, Image.Resampling.LANCZOS)

def add_watermark(img: Image.Image, watermark_path: str = "watermark.png") -> Image.Image:
    """
    Tambahkan watermark PNG transparent di bagian bawah foto
    """
    if not os.path.exists(watermark_path):
        print(f"⚠️ Watermark file not found: {watermark_path}")
        return img

    try:
        # Load watermark
        watermark = Image.open(watermark_path).convert("RGBA")

        # Calculate watermark size (15% of image width)
        img_width, img_height = img.size
        watermark_width = int(img_width * 0.15)

        # Maintain aspect ratio
        watermark_ratio = watermark.size[1] / watermark.size[0]
        watermark_height = int(watermark_width * watermark_ratio)

        # Resize watermark
        watermark = watermark.resize((watermark_width, watermark_height), Image.Resampling.LANCZOS)

        # Position watermark (bottom center, with offset)
        offset_from_bottom = 50  # pixels from bottom
        x_position = (img_width - watermark_width) // 2
        y_position = img_height - watermark_height - offset_from_bottom

        # Convert main image to RGBA for transparency support
        if img.mode != 'RGBA':
            img = img.convert('RGBA')

        # Create a transparent overlay
        overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
        overlay.paste(watermark, (x_position, y_position), watermark)

        # Composite the images
        watermarked = Image.alpha_composite(img, overlay)

        # Convert back to RGB
        final_img = Image.new('RGB', watermarked.size, (255, 255, 255))
        final_img.paste(watermarked, mask=watermarked.split()[-1])

        print(f"🏷️ Watermark added: {watermark_width}x{watermark_height} at ({x_position}, {y_position})")
        return final_img

    except Exception as e:
        print(f"⚠️ Watermark failed: {e}")
        return img

# -------- PROCESS --------
def process_photo(input_path, counter):
    fname = os.path.basename(input_path)
    base, ext = os.path.splitext(fname)
    ext = ext.lower().replace("jpeg", "jpg")

    # Deteksi file type
    is_raw = ext in [".cr2", ".nef", ".arw", ".dng"]

    try:
        wait_until_complete(input_path)

        if is_raw:
            # RAW file handling
            print(f"📷 RAW file detected: {fname}")

            # Backup RAW file (copy original)
            import shutil
            raw_backup_path = os.path.join(RAW_BACKUP_DIR, fname)
            shutil.copy2(input_path, raw_backup_path)
            print(f"📂 RAW Backup → {raw_backup_path}")

            # Convert RAW to JPG for processing (requires rawpy)
            try:
                import rawpy
                with rawpy.imread(input_path) as raw:
                    rgb = raw.postprocess()
                img = Image.fromarray(rgb)
            except ImportError:
                print("⚠️ rawpy not installed, skipping RAW processing")
                print("   Install with: pip install rawpy")
                return
            except Exception as e:
                print(f"⚠️ RAW conversion failed: {e}")
                return
        else:
            # Regular JPG/PNG file
            img = safe_open_image(input_path)

        # Backup processed JPG
        jpg_backup_path = os.path.join(JPG_BACKUP_DIR, base + ".jpg")
        img.convert("RGB").save(jpg_backup_path, "JPEG", quality=95)
        print(f"📂 JPG Backup → {jpg_backup_path}")

        # Auto-detect orientation dan resize
        work_path = os.path.join(WORK_DIR, f"{base}_5R.jpg")
        resized = detect_orientation_and_resize(img)

        # Add watermark (optional - set ENABLE_WATERMARK = True to enable)
        ENABLE_WATERMARK = True
        WATERMARK_FILE = "watermark.png"  # Put your PNG watermark file here

        if ENABLE_WATERMARK:
            resized = add_watermark(resized, WATERMARK_FILE)

        resized.save(work_path, "JPEG", quality=95)
        print(f"🛠️ Processed image ready → {work_path}")

        # Kirim ke Modal API menggunakan robust client
        print(f"🚀 Sending {os.path.basename(work_path)} to Modal API...")

        # Konfigurasi upscaling - bisa diubah sesuai kebutuhan
        UPSCALE_FACTOR = 2  # 1x=original, 2x=double, 3x=triple, 4x=quad
        ENHANCEMENT_METHOD = "auto"  # auto, swinir, basic
        OUTPUT_QUALITY = 95  # 50-100

        success, enhanced_bytes, error_msg = enhance_image_robust(
            image_path=work_path,
            api_url=MODAL_API,
            use_local_fallback=True,  # Enable local fallback jika Modal API gagal
            scale=UPSCALE_FACTOR,
            method=ENHANCEMENT_METHOD,
            quality=OUTPUT_QUALITY
        )

        if not success:
            raise RuntimeError(f"Modal enhance failed: {error_msg}")

        print(f"✅ Modal API enhancement successful! Size: {len(enhanced_bytes)} bytes")

        # Simpan hasil enhance
        enhance_name = f"HFI-event_{counter:03d}.jpg"
        enhance_path = os.path.join(ENHANCED_DIR, enhance_name)
        with open(enhance_path, "wb") as out:
            out.write(enhanced_bytes)
        print(f"✨ Enhanced → {enhance_path}")

        # Upload ke R2 dengan retry mechanism
        upload_success = False
        max_upload_retries = 3

        for upload_attempt in range(max_upload_retries):
            try:
                print(f"☁️ Uploading to R2 (attempt {upload_attempt + 1}/{max_upload_retries})...")
                s3.upload_file(enhance_path, R2_BUCKET, enhance_name)
                public_url = f"{PUBLIC_DOMAIN}/{enhance_name}"
                print(f"✅ Uploaded → {public_url}")

                # Catat URL publik
                with open("urls.txt", "a") as f:
                    f.write(public_url + "\n")

                upload_success = True
                break

            except Exception as upload_error:
                print(f"⚠️ Upload attempt {upload_attempt + 1} failed: {upload_error}")
                if upload_attempt < max_upload_retries - 1:
                    print(f"🔄 Retrying in 5 seconds...")
                    time.sleep(5)
                else:
                    print(f"❌ Upload failed after {max_upload_retries} attempts")
                    # Save to failed uploads log
                    with open("failed_uploads.txt", "a") as f:
                        f.write(f"{enhance_name}: {upload_error}\n")

        if not upload_success:
            print(f"⚠️ File saved locally but upload failed: {enhance_path}")
            print(f"   You can manually upload later or check failed_uploads.txt")

    except Exception as e:
        print(f"❌ Error memproses {fname}: {e}")
        with open("error.log", "a") as f:
            f.write(f"{fname}: {e}\n")

# -------- WATCHDOG --------
class PhotoHandler(FileSystemEventHandler):
    counter = load_counter()
    def on_created(self, event):
        if event.is_directory:
            return
        # Support RAW + JPG formats
        file_ext = event.src_path.lower()
        if file_ext.endswith((".jpg", ".jpeg", ".png", ".cr2", ".nef", ".arw", ".dng")):
            print(f"📸 Detected: {os.path.basename(event.src_path)}")
            process_photo(event.src_path, PhotoHandler.counter)
            PhotoHandler.counter += 1
            save_counter(PhotoHandler.counter)

# -------- MAIN --------
if __name__ == "__main__":
    print(f"🚀 Monitoring folder {INPUT_DIR}/ ...")
    event_handler = PhotoHandler()
    observer = Observer()
    observer.schedule(event_handler, INPUT_DIR, recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
