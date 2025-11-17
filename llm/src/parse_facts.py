import csv

def questionnaire_to_paragraph(csv_file_path, output_txt_path):
    """
    Convert a questionnaire CSV to a formatted paragraph and save to a text file.
    
    Args:
        csv_file_path: Path to the CSV file
        output_txt_path: Path where the text file should be saved
    
    Returns:
        A string formatted as a paragraph
    """
    data = {}
    
    # Read the CSV file
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data[row['Question']] = row['Answer']
    
    # Create the paragraph
    paragraph = (
        f"{data.get('Name', 'Unknown')} is {data.get('Age', 'unknown')} years old, "
        f"born on {data.get('Date of birth', 'an unknown date')} in {data.get('Place of birth', 'an unknown location')}. "
        f"They work as {data.get('Occupation', 'unknown')}. "
        f"Their first favorite film was {data.get('First favorite film', 'unknown')}, "
        f"and their favorite starring role was {data.get('Favorite starring role', 'unknown')}. "
        f"Their favorite leading man is {data.get('Favorite leading man', 'unknown')}. "
        f"They have a fear of {data.get('Biggest fear', 'unknown')}, "
        f"and their favorite color is {data.get('Favorite color', 'unknown')}."
    )
    
    # Write to text file
    with open(output_txt_path, 'w', encoding='utf-8') as file:
        file.write(paragraph)
    
    print(f"Paragraph saved to: {output_txt_path}")
    return paragraph

# Example usage
if __name__ == "__main__":
    csv_path = 'Images Data - Facts.csv'
    txt_path = "data/facts.txt"  # or provide full path like "/path/to/output.txt"
    
    result = questionnaire_to_paragraph(csv_path, txt_path)
    print("\nGenerated paragraph:")
    print(result)
