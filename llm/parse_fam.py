import os
import csv
import io

# --- CONFIGURATION ---
FACTS_FILE = "src/data/facts.txt"

# Raw CSV data provided by user
raw_family_data = """Relationship,Name
self,Tippi Hedren
ex-husband,Peter Griffith
ex-husband,Noel Marshall
ex-husband,Luis Barrenechea
daughter,Melanie Griffith
ex son in law,Steven Bauer
ex son in law,Don Johnson
ex son in law,Antonio Banderas
grandson,Alexander Griffith Bauer
granddaughter,Dakota Johnson
granddaughter,Stella del Carmen Banderas
director,Alfred Hitchcock
ex-fiance,Martin Dinnes"""

def append_family_tree():
    # Ensure facts file exists; if not, create it
    if not os.path.exists(FACTS_FILE):
        print(f"⚠️ '{FACTS_FILE}' not found. Creating a new one.")
        os.makedirs(os.path.dirname(FACTS_FILE), exist_ok=True)
    
    # Parse the CSV data into a readable list
    f = io.StringIO(raw_family_data.strip())
    reader = csv.DictReader(f)
    
    # Build the text block
    text_block = "\n\n### Family & Relationships\n"
    text_block += "The user's family tree and key relationships are as follows:\n"
    
    for row in reader:
        rel = row["Relationship"].strip().replace("-", " ").title()
        name = row["Name"].strip()
        
        if rel.lower() == "self":
            text_block += f"- **User's Identity**: {name}\n"
        else:
            text_block += f"- {rel}: {name}\n"
            
    # Append to file
    try:
        with open(FACTS_FILE, "a", encoding="utf-8") as f:
            f.write(text_block)
        print(f"✅ Successfully appended Family Tree to '{FACTS_FILE}'")
        print("   (Added as a new section at the bottom)")
    except Exception as e:
        print(f"❌ Error writing to file: {e}")

if __name__ == "__main__":
    append_family_tree()
