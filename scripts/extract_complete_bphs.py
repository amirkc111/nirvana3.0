#!/usr/bin/env python3
"""
Extract text from ALL Brihat Parasara Hora Sastra volumes for comprehensive AI training
"""

import sys
import os
import json
from datetime import datetime

def extract_pdf_text(pdf_path, max_pages=100):
    """Extract text from PDF using available methods"""
    
    # Try PyPDF2 first
    try:
        import PyPDF2
        print(f"Using PyPDF2 to extract text from: {os.path.basename(pdf_path)}")
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            total_pages = len(pdf_reader.pages)
            print(f"PDF has {total_pages} pages")
            
            # Extract text from specified number of pages
            pages_to_extract = min(max_pages, total_pages)
            
            for i, page in enumerate(pdf_reader.pages[:pages_to_extract]):
                page_text = page.extract_text()
                if page_text.strip():  # Only add non-empty pages
                    text += f"\n--- PAGE {i+1} ---\n"
                    text += page_text
                    text += "\n"
                
                if i % 20 == 0:
                    print(f"Extracted page {i+1}/{pages_to_extract}")
            
            return text, total_pages
            
    except ImportError:
        print("PyPDF2 not available, trying pdfplumber...")
        
        # Try pdfplumber
        try:
            import pdfplumber
            print(f"Using pdfplumber to extract text from: {os.path.basename(pdf_path)}")
            
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                total_pages = len(pdf.pages)
                print(f"PDF has {total_pages} pages")
                
                pages_to_extract = min(max_pages, total_pages)
                
                for i, page in enumerate(pdf.pages[:pages_to_extract]):
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text += f"\n--- PAGE {i+1} ---\n"
                        text += page_text
                        text += "\n"
                    
                    if i % 20 == 0:
                        print(f"Extracted page {i+1}/{pages_to_extract}")
            
            return text, total_pages
            
        except ImportError:
            print("pdfplumber not available, trying fitz (PyMuPDF)...")
            
            # Try PyMuPDF
            try:
                import fitz
                print(f"Using PyMuPDF to extract text from: {os.path.basename(pdf_path)}")
                
                doc = fitz.open(pdf_path)
                text = ""
                
                total_pages = len(doc)
                print(f"PDF has {total_pages} pages")
                
                pages_to_extract = min(max_pages, total_pages)
                
                for i in range(pages_to_extract):
                    page = doc[i]
                    page_text = page.get_text()
                    if page_text.strip():
                        text += f"\n--- PAGE {i+1} ---\n"
                        text += page_text
                        text += "\n"
                    
                    if i % 20 == 0:
                        print(f"Extracted page {i+1}/{pages_to_extract}")
                
                doc.close()
                return text, total_pages
                
            except ImportError:
                print("No PDF extraction libraries available.")
                print("Please install one of: PyPDF2, pdfplumber, or PyMuPDF")
                return None, 0

def process_bphs_volume(pdf_path, volume_name, max_pages=100):
    """Process a single BPHS volume"""
    print(f"\n{'='*60}")
    print(f"PROCESSING {volume_name.upper()}")
    print(f"{'='*60}")
    
    if not os.path.exists(pdf_path):
        print(f"PDF file not found: {pdf_path}")
        return None
    
    text, total_pages = extract_pdf_text(pdf_path, max_pages)
    
    if text:
        # Save extracted text
        # Get project root (parent of 'scripts' directory)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        output_path = os.path.join(project_root, 'frontend', f"{volume_name}_extracted_text.txt")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        print(f"\n✅ {volume_name} extracted successfully!")
        print(f"📁 Saved to: {output_path}")
        print(f"📊 Total characters: {len(text):,}")
        print(f"📄 Pages processed: {max_pages}/{total_pages}")
        
        # Show preview
        print(f"\n--- PREVIEW OF {volume_name.upper()} ---")
        preview = text[:500].replace('\n', ' ')
        print(preview + "...")
        
        return {
            'volume': volume_name,
            'file_path': output_path,
            'characters': len(text),
            'pages_processed': max_pages,
            'total_pages': total_pages,
            'preview': preview
        }
    else:
        print(f"❌ Failed to extract text from {volume_name}")
        return None

def main():
    print("🚀 COMPLETE BRIHAT PARASARA HORA SASTRA EXTRACTION")
    print("=" * 60)
    
    # Get project root (parent of 'scripts' directory)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Define all BPHS volumes
    bphs_volumes = [
        {
            'path': os.path.join(project_root, 'frontend', 'Maharishi_Parashara_-_Brihat_Parasara_Hora_Sastra_(Vol._1).pdf'),
            'name': 'bphs_volume_1',
            'description': 'Brihat Parasara Hora Sastra Volume 1'
        },
        {
            'path': os.path.join(project_root, 'frontend', 'brihat-parashara-hora-sastra-02.pdf.pdf'),
            'name': 'bphs_volume_2', 
            'description': 'Brihat Parasara Hora Sastra Volume 2'
        },
        {
            'path': os.path.join(project_root, 'frontend', 'brihat-parashara-hora-sastra.pdf'),
            'name': 'bphs_complete',
            'description': 'Complete Brihat Parasara Hora Sastra'
        }
    ]
    
    results = []
    
    # Process each volume
    for volume in bphs_volumes:
        result = process_bphs_volume(
            volume['path'], 
            volume['name'], 
            max_pages=150  # Extract more pages for comprehensive training
        )
        
        if result:
            result['description'] = volume['description']
            results.append(result)
    
    # Create summary report
    print(f"\n{'='*60}")
    print("📊 EXTRACTION SUMMARY")
    print(f"{'='*60}")
    
    total_characters = sum(r['characters'] for r in results)
    total_pages = sum(r['pages_processed'] for r in results)
    
    print(f"✅ Successfully processed {len(results)} volumes")
    print(f"📊 Total characters extracted: {total_characters:,}")
    print(f"📄 Total pages processed: {total_pages}")
    
    for result in results:
        print(f"\n📚 {result['description']}")
        print(f"   📁 File: {os.path.basename(result['file_path'])}")
        print(f"   📊 Characters: {result['characters']:,}")
        print(f"   📄 Pages: {result['pages_processed']}/{result['total_pages']}")
    
    # Save extraction metadata
    metadata = {
        'extraction_date': datetime.now().isoformat(),
        'total_volumes': len(results),
        'total_characters': total_characters,
        'total_pages': total_pages,
        'volumes': results
    }
    
    metadata_path = os.path.join(project_root, 'frontend', 'bphs_extraction_metadata.json')
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"\n📋 Metadata saved to: {metadata_path}")
    print(f"\n🎉 COMPLETE BPHS EXTRACTION FINISHED!")
    print("Your AI now has access to the COMPLETE classical knowledge!")

if __name__ == "__main__":
    main()
