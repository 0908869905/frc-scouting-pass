
import sys
import os

pdf_path = r"d:\frc-6998-scouting-pass\FRC\2026GameManual.pdf"
output_path = r"d:\frc-6998-scouting-pass\FRC\game_manual_text.txt"

def extract_text():
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        print(f"Using pypdf. Pages: {len(reader.pages)}")
        with open(output_path, "w", encoding="utf-8") as f:
            for page in reader.pages:
                f.write(page.extract_text())
        return True
    except ImportError:
        pass

    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(pdf_path)
        print(f"Using PyPDF2. Pages: {len(reader.pages)}")
        with open(output_path, "w", encoding="utf-8") as f:
            for page in reader.pages:
                f.write(page.extract_text())
        return True
    except ImportError:
        pass
        
    print("Error: Neither pypdf nor PyPDF2 is installed.")
    return False

if __name__ == "__main__":
    if extract_text():
        print(f"Text extracted to {output_path}")
    else:
        sys.exit(1)
