import os
import csv

# --- CONFIGURATION ---
CSV_FILE_PATH = "src/daily logs - raw.csv"  # Change this if your file is named differently
OUTPUT_DIR = "src/data/logs"

def create_logs():
    # 1. Check if CSV exists
    if not os.path.exists(CSV_FILE_PATH):
        print(f"❌ Error: CSV file '{CSV_FILE_PATH}' not found.")
        return

    # 2. Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"📂 Output directory ready: {OUTPUT_DIR}")

    count = 0
    
    try:
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8') as csvfile:
            # Use DictReader to automatically map columns by header name
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                # Handle potential whitespace in headers/values
                date_str = row.get("File Name", "").strip()
                morning_entry = row.get("Morning", "").strip()
                evening_entry = row.get("Evening", "").strip()
                
                if not date_str:
                    continue

                file_path = os.path.join(OUTPUT_DIR, f"{date_str}.txt")
                
                # Construct content
                log_content = f"=== Log for {date_str} ===\n\n"
                if morning_entry:
                    log_content += f"[10:00:00] {morning_entry}\n"
                if evening_entry:
                    log_content += f"[19:00:00] {evening_entry}\n"

                # Write file
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(log_content)
                
                print(f"   ✅ Written: {file_path}")
                count += 1

        print(f"\n🎉 Success! Generated {count} log files.")

    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    create_logs()
