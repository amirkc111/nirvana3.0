#!/usr/bin/env python3
"""
Extract COMPLETE text from ALL Brihat Parasara Hora Sastra volumes for comprehensive AI training
NO PAGE LIMITS - EXTRACT EVERYTHING!
"""

import sys
import os
import json
from datetime import datetime

def extract_pdf_text_complete(pdf_path):
    """Extract ALL text from PDF - NO PAGE LIMITS"""
    
    # Try PyPDF2 first
    try:
        import PyPDF2
        print(f"Using PyPDF2 to extract COMPLETE text from: {os.path.basename(pdf_path)}")
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            total_pages = len(pdf_reader.pages)
            print(f"📚 PDF has {total_pages} pages - EXTRACTING ALL PAGES")
            
            # Extract text from ALL pages - NO LIMITS
            for i, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text.strip():  # Only add non-empty pages
                    text += f"\n--- PAGE {i+1} ---\n"
                    text += page_text
                    text += "\n"
                
                if i % 50 == 0 and i > 0:
                    print(f"📄 Extracted page {i+1}/{total_pages} ({((i+1)/total_pages)*100:.1f}%)")
            
            print(f"✅ COMPLETE extraction finished: {total_pages} pages")
            return text, total_pages
            
    except ImportError:
        print("PyPDF2 not available, trying pdfplumber...")
        
        # Try pdfplumber
        try:
            import pdfplumber
            print(f"Using pdfplumber to extract COMPLETE text from: {os.path.basename(pdf_path)}")
            
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                total_pages = len(pdf.pages)
                print(f"📚 PDF has {total_pages} pages - EXTRACTING ALL PAGES")
                
                # Extract text from ALL pages - NO LIMITS
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text += f"\n--- PAGE {i+1} ---\n"
                        text += page_text
                        text += "\n"
                    
                    if i % 50 == 0 and i > 0:
                        print(f"📄 Extracted page {i+1}/{total_pages} ({((i+1)/total_pages)*100:.1f}%)")
            
            print(f"✅ COMPLETE extraction finished: {total_pages} pages")
            return text, total_pages
            
        except ImportError:
            print("pdfplumber not available, trying fitz (PyMuPDF)...")
            
            # Try PyMuPDF
            try:
                import fitz
                print(f"Using PyMuPDF to extract COMPLETE text from: {os.path.basename(pdf_path)}")
                
                doc = fitz.open(pdf_path)
                text = ""
                
                total_pages = len(doc)
                print(f"📚 PDF has {total_pages} pages - EXTRACTING ALL PAGES")
                
                # Extract text from ALL pages - NO LIMITS
                for i in range(total_pages):
                    page = doc[i]
                    page_text = page.get_text()
                    if page_text.strip():
                        text += f"\n--- PAGE {i+1} ---\n"
                        text += page_text
                        text += "\n"
                    
                    if i % 50 == 0 and i > 0:
                        print(f"📄 Extracted page {i+1}/{total_pages} ({((i+1)/total_pages)*100:.1f}%)")
                
                doc.close()
                print(f"✅ COMPLETE extraction finished: {total_pages} pages")
                return text, total_pages
                
            except ImportError:
                print("No PDF extraction libraries available.")
                print("Please install one of: PyPDF2, pdfplumber, or PyMuPDF")
                return None, 0

def process_bphs_volume_complete(pdf_path, volume_name):
    """Process a single BPHS volume - COMPLETE EXTRACTION"""
    print(f"\n{'='*80}")
    print(f"🚀 PROCESSING {volume_name.upper()} - COMPLETE EXTRACTION")
    print(f"{'='*80}")
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        return None
    
    text, total_pages = extract_pdf_text_complete(pdf_path)
    
    if text:
        # Save extracted text
        output_path = f"/Users/amyr/Desktop/Projects/nirvana3.0/frontend/{volume_name}_COMPLETE_extracted_text.txt"
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        print(f"\n🎉 {volume_name} COMPLETE extraction successful!")
        print(f"📁 Saved to: {output_path}")
        print(f"📊 Total characters: {len(text):,}")
        print(f"📄 ALL pages processed: {total_pages}/{total_pages}")
        
        # Show preview
        print(f"\n--- PREVIEW OF {volume_name.upper()} ---")
        preview = text[:800].replace('\n', ' ')
        print(preview + "...")
        
        return {
            'volume': volume_name,
            'file_path': output_path,
            'characters': len(text),
            'pages_processed': total_pages,
            'total_pages': total_pages,
            'preview': preview,
            'status': 'COMPLETE'
        }
    else:
        print(f"❌ Failed to extract text from {volume_name}")
        return None

def main():
    print("🔥 COMPLETE BRIHAT PARASARA HORA SASTRA EXTRACTION - NO LIMITS!")
    print("=" * 80)
    print("📚 EXTRACTING ALL PAGES FROM ALL VOLUMES")
    print("🎯 GOAL: COMPLETE CLASSICAL KNOWLEDGE FOR AI TRAINING")
    print("=" * 80)
    
    # Define all BPHS volumes
    bphs_volumes = [
        {
            'path': '/Users/amyr/Desktop/Projects/nirvana3.0/frontend/Maharishi_Parashara_-_Brihat_Parasara_Hora_Sastra_(Vol._1).pdf',
            'name': 'bphs_volume_1_COMPLETE',
            'description': 'Brihat Parasara Hora Sastra Volume 1 - COMPLETE'
        },
        {
            'path': '/Users/amyr/Desktop/Projects/nirvana3.0/frontend/brihat-parashara-hora-sastra-02.pdf.pdf',
            'name': 'bphs_volume_2_COMPLETE', 
            'description': 'Brihat Parasara Hora Sastra Volume 2 - COMPLETE'
        },
        {
            'path': '/Users/amyr/Desktop/Projects/nirvana3.0/frontend/brihat-parashara-hora-sastra.pdf',
            'name': 'bphs_complete_COMPLETE',
            'description': 'Complete Brihat Parasara Hora Sastra - COMPLETE'
        }
    ]
    
    results = []
    
    # Process each volume - COMPLETE EXTRACTION
    for volume in bphs_volumes:
        result = process_bphs_volume_complete(volume['path'], volume['name'])
        
        if result:
            result['description'] = volume['description']
            results.append(result)
    
    # Create comprehensive summary report
    print(f"\n{'='*80}")
    print("📊 COMPLETE EXTRACTION SUMMARY")
    print(f"{'='*80}")
    
    total_characters = sum(r['characters'] for r in results)
    total_pages = sum(r['pages_processed'] for r in results)
    
    print(f"✅ Successfully processed {len(results)} volumes - COMPLETE EXTRACTION")
    print(f"📊 Total characters extracted: {total_characters:,}")
    print(f"📄 Total pages processed: {total_pages}")
    print(f"🎯 Status: ALL PAGES EXTRACTED - NO LIMITS!")
    
    for result in results:
        print(f"\n📚 {result['description']}")
        print(f"   📁 File: {os.path.basename(result['file_path'])}")
        print(f"   📊 Characters: {result['characters']:,}")
        print(f"   📄 Pages: {result['pages_processed']}/{result['total_pages']} (COMPLETE)")
        print(f"   ✅ Status: {result['status']}")
    
    # Save comprehensive extraction metadata
    metadata = {
        'extraction_date': datetime.now().isoformat(),
        'extraction_type': 'COMPLETE - NO PAGE LIMITS',
        'total_volumes': len(results),
        'total_characters': total_characters,
        'total_pages': total_pages,
        'status': 'COMPLETE EXTRACTION',
        'volumes': results
    }
    
    metadata_path = "/Users/amyr/Desktop/Projects/nirvana3.0/frontend/bphs_COMPLETE_extraction_metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"\n📋 Complete metadata saved to: {metadata_path}")
    print(f"\n🎉 COMPLETE BPHS EXTRACTION FINISHED!")
    print("🔥 Your AI now has access to the COMPLETE classical knowledge!")
    print("📚 ALL PAGES EXTRACTED - NO LIMITS!")
    print("🚀 Ready for ULTIMATE ASTROLOGICAL TRAINING!")

if __name__ == "__main__":
    main()
