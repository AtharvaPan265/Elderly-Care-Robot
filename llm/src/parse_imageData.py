import csv
import os

# Define input CSV file and output directory
input_csv = 'Images Data - mem_to_parse.csv'  # Replace this with your actual CSV filename
output_dir = 'data/parsedMemories'  # Folder to store generated text files

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Read CSV and create text documents
with open(input_csv, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        file_name = row['File_Name'].strip()
        output_path = os.path.join(output_dir, f"{file_name}.txt")
        with open(output_path, 'w', encoding='utf-8') as doc:
            doc.write(f"Image_UID: {file_name}\n")
            doc.write(f"People: {row['People']}\n")
            doc.write(f"Year: {row['Year']}\n")
            doc.write(f"Event: {row['Event']}\n")
            doc.write(f"Story: {row['Story']}\n")

print(f"Documents created successfully in '{output_dir}'")
