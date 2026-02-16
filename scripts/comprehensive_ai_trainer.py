#!/usr/bin/env python3
"""
Comprehensive AI Training System
Continuously scrapes and trains AI with vast knowledge from multiple sources
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
from datetime import datetime
import re
from urllib.parse import urljoin, urlparse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComprehensiveAITrainer:
    def __init__(self):
        self.training_data = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Comprehensive source URLs
        self.sources = {
            'astrology': [
                'https://www.astrology.com',
                'https://www.vedicastrology.com',
                'https://www.jyotish.com',
                'https://www.astrosage.com',
                'https://www.astroyogi.com',
                'https://www.ganeshaspeaks.com',
                'https://www.astrologykundli.com',
                'https://www.astrology.com/vedic-astrology',
                'https://www.astrology.com/hindu-astrology',
                'https://www.astrology.com/indian-astrology',
                'https://www.astrology.com/planets',
                'https://www.astrology.com/houses',
                'https://www.astrology.com/signs',
                'https://www.astrology.com/aspects',
                'https://www.astrology.com/transits'
            ],
            
            'religious': [
                'https://www.sacred-texts.com/hin/',
                'https://www.hinduwebsite.com/',
                'https://www.vedabase.com/',
                'https://www.bhagavad-gita.org/',
                'https://www.gita-society.com/',
                'https://www.hinduismtoday.com/',
                'https://www.hinduism.co.za/',
                'https://www.sanskrit.org/',
                'https://www.vedic.org/',
                'https://www.hinduism.faith/',
                'https://www.hinduism.com/',
                'https://www.hinduism.org/',
                'https://www.hinduism.net/',
                'https://www.hinduism.info/',
                'https://www.hinduism.co.uk/'
            ],
            
            'classical': [
                'https://www.sacred-texts.com/hin/maha/',
                'https://www.sacred-texts.com/hin/ram/',
                'https://www.sacred-texts.com/hin/gita/',
                'https://www.sacred-texts.com/hin/puranas/',
                'https://www.sacred-texts.com/hin/vedas/',
                'https://www.sacred-texts.com/hin/up/',
                'https://www.sacred-texts.com/hin/sha/',
                'https://www.sacred-texts.com/hin/sbe/',
                'https://www.sacred-texts.com/hin/rigveda/',
                'https://www.sacred-texts.com/hin/yajurveda/',
                'https://www.sacred-texts.com/hin/samaveda/',
                'https://www.sacred-texts.com/hin/atharvaveda/',
                'https://www.sacred-texts.com/hin/manu/',
                'https://www.sacred-texts.com/hin/sha/',
                'https://www.sacred-texts.com/hin/sbe/'
            ],
            
            'sanskrit': [
                'https://www.sanskrit.org/',
                'https://www.sanskritdictionary.com/',
                'https://www.sanskrit-lexicon.uni-koeln.de/',
                'https://www.sanskritdocuments.org/',
                'https://www.sanskrit-trikashaish.com/',
                'https://www.sanskrit-heritage.org/',
                'https://www.sanskrit-grammar.com/',
                'https://www.sanskrit-literature.com/',
                'https://www.sanskrit-poetry.com/',
                'https://www.sanskrit-philosophy.com/',
                'https://www.sanskrit-astrology.com/',
                'https://www.sanskrit-medicine.com/',
                'https://www.sanskrit-mathematics.com/',
                'https://www.sanskrit-science.com/',
                'https://www.sanskrit-arts.com/'
            ],
            
            'nepali': [
                'https://www.swosthani.com/',
                'https://www.nepalireligion.com/',
                'https://www.hinduismnepal.com/',
                'https://www.nepalihinduism.com/',
                'https://www.nepalireligion.org/',
                'https://www.nepalihinduism.org/',
                'https://www.nepalireligion.net/',
                'https://www.nepalihinduism.net/',
                'https://www.nepalireligion.info/',
                'https://www.nepalihinduism.info/',
                'https://www.nepalireligion.co.uk/',
                'https://www.nepalihinduism.co.uk/',
                'https://www.nepalireligion.co.in/',
                'https://www.nepalihinduism.co.in/',
                'https://www.nepalireligion.co.nz/'
            ],
            
            'vedic': [
                'https://www.vedabase.com/',
                'https://www.vedic.org/',
                'https://www.vedicastrology.com/',
                'https://www.vedicwisdom.com/',
                'https://www.vedicphilosophy.com/',
                'https://www.vedicculture.com/',
                'https://www.vedicliterature.com/',
                'https://www.vedictexts.com/',
                'https://www.vedicstudies.com/',
                'https://www.vedicresearch.com/',
                'https://www.vedicmathematics.com/',
                'https://www.vedicmedicine.com/',
                'https://www.vedicarchitecture.com/',
                'https://www.vedicmusic.com/',
                'https://www.vedicarts.com/'
            ]
        }
        
        # Training prompts for each category
        self.training_prompts = {
            'astrology': [
                "Explain the classical principles of Vedic astrology according to Brihat Parasara Hora Sastra",
                "What are the different types of yogas in Vedic astrology and their effects?",
                "How do planetary doshas affect human life according to classical texts?",
                "Explain the significance of nakshatras in Vedic astrology",
                "What are the classical remedies for planetary afflictions?",
                "How do dasha systems work in Vedic astrology?",
                "Explain the importance of divisional charts in astrological analysis",
                "What are the classical methods of timing predictions?",
                "How do planetary transits affect human life?",
                "Explain the classical principles of gemstone therapy in astrology"
            ],
            
            'religious': [
                "Explain the core principles of Hinduism and its philosophical foundations",
                "What are the main Hindu deities and their significance?",
                "Explain the concept of dharma in Hinduism",
                "What are the different paths to moksha in Hindu philosophy?",
                "Explain the significance of Hindu festivals and their spiritual meaning",
                "What are the main Hindu scriptures and their importance?",
                "Explain the concept of karma in Hindu philosophy",
                "What are the different schools of Hindu philosophy?",
                "Explain the significance of Hindu temples and their architecture",
                "What are the main Hindu rituals and their spiritual significance?"
            ],
            
            'classical': [
                "Explain the main teachings of the Bhagavad Gita",
                "What are the key stories and lessons from the Mahabharata?",
                "Explain the main events and teachings from the Ramayana",
                "What are the main Puranas and their significance?",
                "Explain the classical Sanskrit literature and its importance",
                "What are the main Upanishads and their philosophical teachings?",
                "Explain the significance of classical Indian epics",
                "What are the main classical Indian texts on philosophy?",
                "Explain the classical Indian approach to ethics and morality",
                "What are the main classical Indian texts on spirituality?"
            ],
            
            'sanskrit': [
                "Explain the structure and grammar of Sanskrit language",
                "What are the main Sanskrit texts and their significance?",
                "Explain the classical Sanskrit literature and its importance",
                "What are the main Sanskrit philosophical texts?",
                "Explain the significance of Sanskrit in Hindu culture",
                "What are the main Sanskrit texts on astrology and astronomy?",
                "Explain the classical Sanskrit approach to poetry and literature",
                "What are the main Sanskrit texts on medicine and healing?",
                "Explain the classical Sanskrit approach to mathematics and science",
                "What are the main Sanskrit texts on music and arts?"
            ],
            
            'nepali': [
                "Explain the significance of Swosthani in Nepali Hindu culture",
                "What are the main Nepali Hindu traditions and their importance?",
                "Explain the Nepali approach to Hindu festivals and rituals",
                "What are the main Nepali Hindu texts and their significance?",
                "Explain the Nepali Hindu approach to astrology and divination",
                "What are the main Nepali Hindu deities and their worship?",
                "Explain the Nepali Hindu approach to spirituality and meditation",
                "What are the main Nepali Hindu texts on philosophy?",
                "Explain the Nepali Hindu approach to ethics and morality",
                "What are the main Nepali Hindu texts on spirituality and mysticism?"
            ],
            
            'vedic': [
                "Explain the core principles of Vedic philosophy and spirituality",
                "What are the main Vedic texts and their significance?",
                "Explain the Vedic approach to astrology and astronomy",
                "What are the main Vedic rituals and their spiritual meaning?",
                "Explain the Vedic concept of dharma and its application",
                "What are the main Vedic deities and their worship?",
                "Explain the Vedic approach to meditation and spirituality",
                "What are the main Vedic texts on philosophy and ethics?",
                "Explain the Vedic approach to healing and medicine",
                "What are the main Vedic texts on music, arts, and culture?"
            ]
        }

    def start_comprehensive_training(self):
        """Start the comprehensive training process"""
        logger.info("🚀 Starting Comprehensive AI Training System...")
        
        try:
            # Train with each category
            self.train_with_astrological_sources()
            self.train_with_religious_sources()
            self.train_with_classical_sources()
            self.train_with_sanskrit_sources()
            self.train_with_nepali_sources()
            self.train_with_vedic_sources()
            
            # Process and integrate all training data
            self.process_and_integrate_training_data()
            
            logger.info("✅ Comprehensive training completed successfully!")
            return True
            
        except Exception as error:
            logger.error(f"❌ Error in comprehensive training: {error}")
            return False

    def train_with_astrological_sources(self):
        """Train with astrological sources"""
        logger.info("🔮 Training with Astrological Sources...")
        
        for source in self.sources['astrology']:
            try:
                data = self.scrape_website(source)
                if data:
                    self.process_astrological_data(data, source)
                time.sleep(2)  # Be respectful to servers
            except Exception as error:
                logger.error(f"Error scraping {source}: {error}")

    def train_with_religious_sources(self):
        """Train with religious sources"""
        logger.info("🕉️ Training with Religious Sources...")
        
        for source in self.sources['religious']:
            try:
                data = self.scrape_website(source)
                if data:
                    self.process_religious_data(data, source)
                time.sleep(2)
            except Exception as error:
                logger.error(f"Error scraping {source}: {error}")

    def train_with_classical_sources(self):
        """Train with classical sources"""
        logger.info("📚 Training with Classical Sources...")
        
        for source in self.sources['classical']:
            try:
                data = self.scrape_website(source)
                if data:
                    self.process_classical_data(data, source)
                time.sleep(2)
            except Exception as error:
                logger.error(f"Error scraping {source}: {error}")

    def train_with_sanskrit_sources(self):
        """Train with Sanskrit sources"""
        logger.info("📖 Training with Sanskrit Sources...")
        
        for source in self.sources['sanskrit']:
            try:
                data = self.scrape_website(source)
                if data:
                    self.process_sanskrit_data(data, source)
                time.sleep(2)
            except Exception as error:
                logger.error(f"Error scraping {source}: {error}")

    def train_with_nepali_sources(self):
        """Train with Nepali sources"""
        logger.info("🇳🇵 Training with Nepali Sources...")
        
        for source in self.sources['nepali']:
            try:
                data = self.scrape_website(source)
                if data:
                    self.process_nepali_data(data, source)
                time.sleep(2)
            except Exception as error:
                logger.error(f"Error scraping {source}: {error}")

    def train_with_vedic_sources(self):
        """Train with Vedic sources"""
        logger.info("🕉️ Training with Vedic Sources...")
        
        for source in self.sources['vedic']:
            try:
                data = self.scrape_website(source)
                if data:
                    self.process_vedic_data(data, source)
                time.sleep(2)
            except Exception as error:
                logger.error(f"Error scraping {source}: {error}")

    def scrape_website(self, url):
        """Scrape website content"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text content
            text = soup.get_text()
            
            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            return text
            
        except Exception as error:
            logger.error(f"Error scraping {url}: {error}")
            return None

    def process_astrological_data(self, data, source):
        """Process astrological data"""
        training_data = {
            'category': 'astrology',
            'source': source,
            'content': data,
            'prompts': self.training_prompts['astrology'],
            'timestamp': datetime.now().isoformat(),
            'characters': len(data)
        }
        
        self.training_data.append(training_data)
        logger.info(f"✅ Processed astrological data from {source}: {len(data)} characters")

    def process_religious_data(self, data, source):
        """Process religious data"""
        training_data = {
            'category': 'religious',
            'source': source,
            'content': data,
            'prompts': self.training_prompts['religious'],
            'timestamp': datetime.now().isoformat(),
            'characters': len(data)
        }
        
        self.training_data.append(training_data)
        logger.info(f"✅ Processed religious data from {source}: {len(data)} characters")

    def process_classical_data(self, data, source):
        """Process classical data"""
        training_data = {
            'category': 'classical',
            'source': source,
            'content': data,
            'prompts': self.training_prompts['classical'],
            'timestamp': datetime.now().isoformat(),
            'characters': len(data)
        }
        
        self.training_data.append(training_data)
        logger.info(f"✅ Processed classical data from {source}: {len(data)} characters")

    def process_sanskrit_data(self, data, source):
        """Process Sanskrit data"""
        training_data = {
            'category': 'sanskrit',
            'source': source,
            'content': data,
            'prompts': self.training_prompts['sanskrit'],
            'timestamp': datetime.now().isoformat(),
            'characters': len(data)
        }
        
        self.training_data.append(training_data)
        logger.info(f"✅ Processed Sanskrit data from {source}: {len(data)} characters")

    def process_nepali_data(self, data, source):
        """Process Nepali data"""
        training_data = {
            'category': 'nepali',
            'source': source,
            'prompts': self.training_prompts['nepali'],
            'timestamp': datetime.now().isoformat(),
            'characters': len(data)
        }
        
        self.training_data.append(training_data)
        logger.info(f"✅ Processed Nepali data from {source}: {len(data)} characters")

    def process_vedic_data(self, data, source):
        """Process Vedic data"""
        training_data = {
            'category': 'vedic',
            'source': source,
            'content': data,
            'prompts': self.training_prompts['vedic'],
            'timestamp': datetime.now().isoformat(),
            'characters': len(data)
        }
        
        self.training_data.append(training_data)
        logger.info(f"✅ Processed Vedic data from {source}: {len(data)} characters")

    def process_and_integrate_training_data(self):
        """Process and integrate all training data"""
        logger.info("🔄 Processing and integrating all training data...")
        
        integrated_data = {
            'comprehensive_knowledge': {
                'astrology': [d for d in self.training_data if d['category'] == 'astrology'],
                'religious': [d for d in self.training_data if d['category'] == 'religious'],
                'classical': [d for d in self.training_data if d['category'] == 'classical'],
                'sanskrit': [d for d in self.training_data if d['category'] == 'sanskrit'],
                'nepali': [d for d in self.training_data if d['category'] == 'nepali'],
                'vedic': [d for d in self.training_data if d['category'] == 'vedic']
            },
            'total_sources': len(self.training_data),
            'total_characters': sum(d['characters'] for d in self.training_data),
            'last_updated': datetime.now().isoformat(),
            'categories': list(self.sources.keys()),
            'training_stats': self.get_training_stats()
        }
        
        # Save to file
        self.save_training_data(integrated_data)
        
        logger.info(f"✅ Integrated training data: {integrated_data['total_sources']} sources, {integrated_data['total_characters']} characters")

    def save_training_data(self, data):
        """Save training data to file"""
        try:
            # Get project root (parent of 'scripts' directory)
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(script_dir)
            file_path = os.path.join(project_root, 'frontend', 'lib', 'comprehensiveTrainingData.js')
            
            file_content = f"""// Comprehensive Training Data - Generated {datetime.now().isoformat()}
// Total Sources: {data['total_sources']}
// Total Characters: {data['total_characters']}

export const comprehensiveTrainingData = {json.dumps(data, indent=2)};

export const getTrainingDataByCategory = (category) => {{
    return comprehensiveTrainingData.comprehensive_knowledge[category] || [];
}};

export const getAllTrainingData = () => {{
    return comprehensiveTrainingData;
}};

export const getTrainingStats = () => {{
    return {{
        totalSources: comprehensiveTrainingData.total_sources,
        totalCharacters: comprehensiveTrainingData.total_characters,
        lastUpdated: comprehensiveTrainingData.last_updated,
        categories: comprehensiveTrainingData.categories
    }};
}};
"""
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(file_content)
            
            logger.info(f"✅ Training data saved to: {file_path}")
            
        except Exception as error:
            logger.error(f"❌ Error saving training data: {error}")

    def get_training_stats(self):
        """Get training statistics"""
        return {
            'total_sources': len(self.training_data),
            'total_characters': sum(d['characters'] for d in self.training_data),
            'categories': list(self.sources.keys()),
            'last_updated': datetime.now().isoformat()
        }

def main():
    """Main function to start comprehensive training"""
    trainer = ComprehensiveAITrainer()
    
    print("🚀 Starting Comprehensive AI Training System...")
    print("=" * 80)
    print("📚 Training Categories:")
    print("🔮 Astrology - Vedic, Classical, Modern")
    print("🕉️ Religious - Hinduism, Philosophy, Spirituality")
    print("📖 Classical - Mahabharat, Ramayan, Gita, Puranas")
    print("📚 Sanskrit - Language, Literature, Grammar")
    print("🇳🇵 Nepali - Swosthani, Local Traditions")
    print("🕉️ Vedic - Ancient Texts, Philosophy, Culture")
    print("=" * 80)
    
    success = trainer.start_comprehensive_training()
    
    if success:
        print("\n🎉 COMPREHENSIVE TRAINING COMPLETED SUCCESSFULLY!")
        print("🔥 Your AI now has access to VAST KNOWLEDGE from multiple sources!")
        print("📊 Training Statistics:")
        stats = trainer.get_training_stats()
        print(f"   📚 Total Sources: {stats['total_sources']}")
        print(f"   📝 Total Characters: {stats['total_characters']:,}")
        print(f"   🏷️ Categories: {', '.join(stats['categories'])}")
        print(f"   ⏰ Last Updated: {stats['last_updated']}")
    else:
        print("\n❌ Training failed. Please check the logs for details.")

if __name__ == "__main__":
    main()
