#!/usr/bin/env python3
"""
Extract text from Brihat Parasara Hora Sastra PDF for AI training
"""

import sys
import os

def extract_pdf_text(pdf_path):
    """Extract text from PDF using available methods"""
    
    # Try PyPDF2 first
    try:
        import PyPDF2
        print("Using PyPDF2 to extract text...")
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            print(f"PDF has {len(pdf_reader.pages)} pages")
            
            # Extract text from first 50 pages (to avoid overwhelming the AI)
            for i, page in enumerate(pdf_reader.pages[:50]):
                page_text = page.extract_text()
                text += f"\n--- PAGE {i+1} ---\n"
                text += page_text
                text += "\n"
                
                if i % 10 == 0:
                    print(f"Extracted page {i+1}")
            
            return text
            
    except ImportError:
        print("PyPDF2 not available, trying pdfplumber...")
        
        # Try pdfplumber
        try:
            import pdfplumber
            print("Using pdfplumber to extract text...")
            
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                print(f"PDF has {len(pdf.pages)} pages")
                
                # Extract text from first 50 pages
                for i, page in enumerate(pdf.pages[:50]):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- PAGE {i+1} ---\n"
                        text += page_text
                        text += "\n"
                    
                    if i % 10 == 0:
                        print(f"Extracted page {i+1}")
            
            return text
            
        except ImportError:
            print("pdfplumber not available, trying fitz (PyMuPDF)...")
            
            # Try PyMuPDF
            try:
                import fitz
                print("Using PyMuPDF to extract text...")
                
                doc = fitz.open(pdf_path)
                text = ""
                
                print(f"PDF has {len(doc)} pages")
                
                # Extract text from first 50 pages
                for i in range(min(50, len(doc))):
                    page = doc[i]
                    page_text = page.get_text()
                    text += f"\n--- PAGE {i+1} ---\n"
                    text += page_text
                    text += "\n"
                    
                    if i % 10 == 0:
                        print(f"Extracted page {i+1}")
                
                doc.close()
                return text
                
            except ImportError:
                print("No PDF extraction libraries available.")
                print("Please install one of: PyPDF2, pdfplumber, or PyMuPDF")
                return None

def main():
    pdf_path = "/Users/amyr/Desktop/Projects/nirvana3.0/frontend/Maharishi_Parashara_-_Brihat_Parasara_Hora_Sastra_(Vol._1).pdf"
    
    if not os.path.exists(pdf_path):
        print(f"PDF file not found: {pdf_path}")
        return
    
    print(f"Extracting text from: {pdf_path}")
    
    text = extract_pdf_text(pdf_path)
    
    if text:
        # Save extracted text
        output_path = "/Users/amyr/Desktop/Projects/nirvana3.0/frontend/bphs_extracted_text.txt"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        print(f"\nExtracted text saved to: {output_path}")
        print(f"Total characters extracted: {len(text)}")
        
        # Show first 1000 characters as preview
        print("\n--- PREVIEW ---")
        print(text[:1000])
        print("...")
        
    else:
        print("Failed to extract text from PDF")

if __name__ == "__main__":
    main()
