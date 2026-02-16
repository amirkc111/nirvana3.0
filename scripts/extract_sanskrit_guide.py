#!/usr/bin/env python3
"""
Extract comprehensive content from Sanskrit Guide PDF for AI training
"""

import sys
import os
import json
from datetime import datetime

def extract_pdf_text(pdf_path):
    """Extract text from PDF using multiple methods"""
    
    # Try PyPDF2 first
    try:
        import PyPDF2
        print(f"Using PyPDF2 to extract text from: {os.path.basename(pdf_path)}")
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            total_pages = len(pdf_reader.pages)
            print(f"📚 PDF has {total_pages} pages - EXTRACTING ALL PAGES")
            
            # Extract text from ALL pages
            for i, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text.strip():  # Only add non-empty pages
                    text += f"\n--- PAGE {i+1} ---\n"
                    text += page_text
                    text += "\n"
                
                if i % 10 == 0 and i > 0:
                    print(f"📄 Extracted page {i+1}/{total_pages} ({((i+1)/total_pages)*100:.1f}%)")
            
            print(f"✅ Extraction finished: {total_pages} pages")
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
                print(f"📚 PDF has {total_pages} pages - EXTRACTING ALL PAGES")
                
                # Extract text from ALL pages
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text += f"\n--- PAGE {i+1} ---\n"
                        text += page_text
                        text += "\n"
                    
                    if i % 10 == 0 and i > 0:
                        print(f"📄 Extracted page {i+1}/{total_pages} ({((i+1)/total_pages)*100:.1f}%)")
            
            print(f"✅ Extraction finished: {total_pages} pages")
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
                print(f"📚 PDF has {total_pages} pages - EXTRACTING ALL PAGES")
                
                # Extract text from ALL pages
                for i in range(total_pages):
                    page = doc[i]
                    page_text = page.get_text()
                    if page_text.strip():
                        text += f"\n--- PAGE {i+1} ---\n"
                        text += page_text
                        text += "\n"
                    
                    if i % 10 == 0 and i > 0:
                        print(f"📄 Extracted page {i+1}/{total_pages} ({((i+1)/total_pages)*100:.1f}%)")
                
                doc.close()
                print(f"✅ Extraction finished: {total_pages} pages")
                return text, total_pages
                
            except ImportError:
                print("No PDF extraction libraries available.")
                print("Please install one of: PyPDF2, pdfplumber, or PyMuPDF")
                return None, 0

def process_sanskrit_content(text):
    """Process and structure Sanskrit content for AI training"""
    
    # Split content into sections
    sections = {
        'basic_grammar': [],
        'vocabulary': [],
        'verbs': [],
        'nouns': [],
        'sentences': [],
        'exercises': [],
        'examples': []
    }
    
    # Process content line by line
    lines = text.split('\n')
    current_section = 'basic_grammar'
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Identify sections
        if any(keyword in line.lower() for keyword in ['vocabulary', 'शब्दावली', 'words']):
            current_section = 'vocabulary'
        elif any(keyword in line.lower() for keyword in ['verb', 'क्रिया', 'action']):
            current_section = 'verbs'
        elif any(keyword in line.lower() for keyword in ['noun', 'संज्ञा', 'name']):
            current_section = 'nouns'
        elif any(keyword in line.lower() for keyword in ['sentence', 'वाक्य', 'example']):
            current_section = 'sentences'
        elif any(keyword in line.lower() for keyword in ['exercise', 'अभ्यास', 'practice']):
            current_section = 'exercises'
        else:
            sections[current_section].append(line)
    
    return sections

def create_sanskrit_training_data(sections, raw_text):
    """Create comprehensive Sanskrit training data"""
    
    training_data = {
        'sanskrit_guide': {
            'title': 'Sanskrit Guide - Complete Learning Resource',
            'description': 'Comprehensive Sanskrit learning guide covering grammar, vocabulary, verbs, nouns, and practical examples',
            'raw_content': raw_text,
            'structured_content': sections,
            'total_characters': len(raw_text),
            'extraction_date': datetime.now().isoformat()
        },
        
        'sanskrit_knowledge': {
            'basic_grammar': {
                'description': 'Fundamental Sanskrit grammar rules and principles',
                'content': sections['basic_grammar'],
                'topics': [
                    'Sanskrit alphabet and pronunciation',
                    'Basic grammatical rules',
                    'Sandhi (sound combinations)',
                    'Declension patterns',
                    'Conjugation patterns'
                ]
            },
            
            'vocabulary': {
                'description': 'Essential Sanskrit vocabulary and word meanings',
                'content': sections['vocabulary'],
                'topics': [
                    'Common Sanskrit words',
                    'Word meanings and translations',
                    'Root words and derivatives',
                    'Synonyms and antonyms',
                    'Technical terminology'
                ]
            },
            
            'verbs': {
                'description': 'Sanskrit verb forms and conjugations',
                'content': sections['verbs'],
                'topics': [
                    'Verb roots and stems',
                    'Present, past, and future tenses',
                    'Active and passive voices',
                    'Moods and aspects',
                    'Irregular verbs'
                ]
            },
            
            'nouns': {
                'description': 'Sanskrit noun declensions and cases',
                'content': sections['nouns'],
                'topics': [
                    'Noun declensions',
                    'Case endings',
                    'Gender and number',
                    'Compound words',
                    'Proper nouns'
                ]
            },
            
            'sentences': {
                'description': 'Sanskrit sentence construction and examples',
                'content': sections['sentences'],
                'topics': [
                    'Sentence structure',
                    'Word order',
                    'Complex sentences',
                    'Poetic language',
                    'Classical examples'
                ]
            },
            
            'exercises': {
                'description': 'Practice exercises and drills',
                'content': sections['exercises'],
                'topics': [
                    'Translation exercises',
                    'Grammar drills',
                    'Vocabulary practice',
                    'Reading comprehension',
                    'Writing exercises'
                ]
            }
        },
        
        'training_prompts': {
            'sanskrit_learning': [
                "Explain the basic principles of Sanskrit grammar",
                "What are the main Sanskrit verb forms and their conjugations?",
                "How do Sanskrit noun declensions work?",
                "Explain the concept of Sandhi in Sanskrit",
                "What are the essential Sanskrit vocabulary words?",
                "How do you construct basic Sanskrit sentences?",
                "Explain the Sanskrit alphabet and pronunciation",
                "What are the different Sanskrit cases and their uses?",
                "How do you read and understand Sanskrit texts?",
                "What are the key differences between Sanskrit and modern languages?"
            ],
            
            'sanskrit_astrology': [
                "Explain Sanskrit terms used in Vedic astrology",
                "What are the Sanskrit names for planets and zodiac signs?",
                "How do you pronounce Sanskrit astrological terms?",
                "Explain Sanskrit mantras used in astrological remedies",
                "What are the Sanskrit names for nakshatras and their meanings?",
                "How do you read Sanskrit astrological texts?",
                "Explain Sanskrit terminology in classical astrological texts",
                "What are the Sanskrit names for houses and aspects?",
                "How do you understand Sanskrit astrological calculations?",
                "What are the Sanskrit terms for yogas and doshas?"
            ],
            
            'sanskrit_religion': [
                "Explain Sanskrit terms used in Hindu religious texts",
                "What are the Sanskrit names for Hindu deities?",
                "How do you pronounce Sanskrit mantras and prayers?",
                "Explain Sanskrit terminology in the Vedas and Upanishads",
                "What are the Sanskrit names for religious concepts?",
                "How do you read Sanskrit religious scriptures?",
                "Explain Sanskrit terms in the Bhagavad Gita",
                "What are the Sanskrit names for religious rituals?",
                "How do you understand Sanskrit philosophical terms?",
                "What are the Sanskrit terms for spiritual practices?"
            ]
        }
    }
    
    return training_data

def main():
    """Main function to extract Sanskrit guide content"""
    # Get project root (parent of 'scripts' directory)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    pdf_path = os.path.join(project_root, 'frontend', 'sanskritguide.pdf')
    
    print("📚 SANSKRIT GUIDE EXTRACTION FOR AI TRAINING")
    print("=" * 80)
    print("🎯 GOAL: Extract comprehensive Sanskrit knowledge for AI training")
    print("📖 SOURCE: Sanskrit Guide PDF")
    print("=" * 80)
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        return
    
    # Extract text from PDF
    text, total_pages = extract_pdf_text(pdf_path)
    
    if text:
        print(f"\n🎉 Sanskrit Guide extraction successful!")
        print(f"📊 Total pages processed: {total_pages}")
        print(f"📝 Total characters: {len(text):,}")
        
        # Process content
        print("\n🔄 Processing Sanskrit content...")
        sections = process_sanskrit_content(text)
        
        # Create training data
        print("📚 Creating comprehensive training data...")
        training_data = create_sanskrit_training_data(sections, text)
        
        # Save to file
        output_path = os.path.join(project_root, 'frontend', 'lib', 'sanskritGuideTrainingData.js')
        
        file_content = f"""// Sanskrit Guide Training Data - Generated {datetime.now().isoformat()}
// Total Pages: {total_pages}
// Total Characters: {len(text):,}

export const sanskritGuideTrainingData = {json.dumps(training_data, indent=2, ensure_ascii=False)};

export const getSanskritKnowledge = () => {{
    return sanskritGuideTrainingData.sanskrit_knowledge;
}};

export const getSanskritTrainingPrompts = () => {{
    return sanskritGuideTrainingData.training_prompts;
}};

export const getSanskritGuideStats = () => {{
    return {{
        totalPages: {total_pages},
        totalCharacters: {len(text)},
        extractionDate: sanskritGuideTrainingData.sanskrit_guide.extraction_date
    }};
}};
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(file_content)
        
        print(f"✅ Sanskrit training data saved to: {output_path}")
        
        # Show preview
        print(f"\n--- PREVIEW OF SANSKRIT GUIDE ---")
        preview = text[:1000].replace('\n', ' ')
        print(preview + "...")
        
        print(f"\n🎉 SANSKRIT GUIDE EXTRACTION COMPLETED!")
        print("🔥 Your AI now has access to comprehensive Sanskrit knowledge!")
        print("📚 Ready for advanced Sanskrit and classical language training!")
        
    else:
        print("❌ Failed to extract text from Sanskrit Guide PDF")

if __name__ == "__main__":
    main()
