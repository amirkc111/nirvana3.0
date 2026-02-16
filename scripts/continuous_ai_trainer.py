#!/usr/bin/env python3
"""
Continuous AI Training System
Continuously scrapes and trains AI with vast knowledge from multiple sources
Runs in background to keep enhancing AI knowledge
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
import schedule
from datetime import datetime
import logging
import random
from urllib.parse import urljoin, urlparse

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ContinuousAITrainer:
    def __init__(self):
        self.training_data = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Expanded source URLs for continuous training
        self.sources = {
            'astrology': [
                'https://www.astrology.com',
                'https://www.vedicastrology.com',
                'https://www.astrosage.com',
                'https://www.astroyogi.com',
                'https://www.ganeshaspeaks.com',
                'https://www.astrologykundli.com',
                'https://www.astrology.com/planets',
                'https://www.astrology.com/houses',
                'https://www.astrology.com/signs',
                'https://www.astrology.com/aspects',
                'https://www.astrology.com/transits',
                'https://www.astrology.com/retrogrades',
                'https://www.astrology.com/lunar-phases',
                'https://www.astrology.com/solar-eclipses',
                'https://www.astrology.com/lunar-eclipses'
            ],
            
            'religious': [
                'https://www.sacred-texts.com/hin/',
                'https://www.vedabase.com/',
                'https://www.bhagavad-gita.org/',
                'https://www.gita-society.com/',
                'https://www.hinduismtoday.com/',
                'https://www.hinduism.co.za/',
                'https://www.sanskrit.org/',
                'https://www.vedic.org/',
                'https://www.hinduism.org/',
                'https://www.hinduism.net/',
                'https://www.hinduism.co.uk/',
                'https://www.hinduism.com/',
                'https://www.hinduism.faith/',
                'https://www.hinduism.info/',
                'https://www.hinduism.net/'
            ],
            
            'classical': [
                'https://www.sacred-texts.com/hin/maha/',
                'https://www.sacred-texts.com/hin/gita/',
                'https://www.sacred-texts.com/hin/sha/',
                'https://www.sacred-texts.com/hin/rigveda/',
                'https://www.sacred-texts.com/hin/yajurveda/',
                'https://www.sacred-texts.com/hin/samaveda/',
                'https://www.sacred-texts.com/hin/atharvaveda/',
                'https://www.sacred-texts.com/hin/manu/',
                'https://www.sacred-texts.com/hin/up/',
                'https://www.sacred-texts.com/hin/puranas/',
                'https://www.sacred-texts.com/hin/vedas/',
                'https://www.sacred-texts.com/hin/sbe/',
                'https://www.sacred-texts.com/hin/ram/',
                'https://www.sacred-texts.com/hin/maha/',
                'https://www.sacred-texts.com/hin/gita/'
            ],
            
            'sanskrit': [
                'https://www.sanskrit.org/',
                'https://www.sanskritdocuments.org/',
                'https://www.sanskrit-lexicon.uni-koeln.de/',
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
                'https://www.sanskrit-arts.com/',
                'https://www.sanskrit-music.com/'
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

    def start_continuous_training(self):
        """Start the continuous training process"""
        logger.info("🚀 Starting Continuous AI Training System...")
        
        # Schedule training every 6 hours
        schedule.every(6).hours.do(self.run_training_cycle)
        
        # Schedule training every day at 2 AM
        schedule.every().day.at("02:00").do(self.run_full_training_cycle)
        
        # Schedule training every week on Sunday at 3 AM
        schedule.every().sunday.at("03:00").do(self.run_comprehensive_training_cycle)
        
        # Run initial training
        self.run_training_cycle()
        
        # Keep running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    def run_training_cycle(self):
        """Run a single training cycle"""
        logger.info("🔄 Running training cycle...")
        
        try:
            # Randomly select 5 sources from each category
            for category in self.sources:
                sources = random.sample(self.sources[category], min(5, len(self.sources[category])))
                
                for source in sources:
                    try:
                        data = self.scrape_website(source)
                        if data:
                            self.process_training_data(data, source, category)
                        time.sleep(random.uniform(1, 3))  # Random delay
                    except Exception as error:
                        logger.error(f"Error scraping {source}: {error}")
            
            # Save training data
            self.save_training_data()
            
            logger.info("✅ Training cycle completed successfully!")
            
        except Exception as error:
            logger.error(f"❌ Error in training cycle: {error}")

    def run_full_training_cycle(self):
        """Run a full training cycle with all sources"""
        logger.info("🔄 Running full training cycle...")
        
        try:
            for category in self.sources:
                for source in self.sources[category]:
                    try:
                        data = self.scrape_website(source)
                        if data:
                            self.process_training_data(data, source, category)
                        time.sleep(random.uniform(2, 5))  # Random delay
                    except Exception as error:
                        logger.error(f"Error scraping {source}: {error}")
            
            # Save training data
            self.save_training_data()
            
            logger.info("✅ Full training cycle completed successfully!")
            
        except Exception as error:
            logger.error(f"❌ Error in full training cycle: {error}")

    def run_comprehensive_training_cycle(self):
        """Run a comprehensive training cycle with deep analysis"""
        logger.info("🔄 Running comprehensive training cycle...")
        
        try:
            # Run full training cycle
            self.run_full_training_cycle()
            
            # Additional deep analysis
            self.analyze_training_data()
            
            # Generate training reports
            self.generate_training_report()
            
            logger.info("✅ Comprehensive training cycle completed successfully!")
            
        except Exception as error:
            logger.error(f"❌ Error in comprehensive training cycle: {error}")

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

    def process_training_data(self, data, source, category):
        """Process training data"""
        training_data = {
            'category': category,
            'source': source,
            'content': data,
            'prompts': self.training_prompts[category],
            'timestamp': datetime.now().isoformat(),
            'characters': len(data)
        }
        
        self.training_data.append(training_data)
        logger.info(f"✅ Processed {category} data from {source}: {len(data)} characters")

    def analyze_training_data(self):
        """Analyze training data for insights"""
        logger.info("🔍 Analyzing training data...")
        
        analysis = {
            'total_sources': len(self.training_data),
            'total_characters': sum(d['characters'] for d in self.training_data),
            'categories': {},
            'sources': {},
            'insights': []
        }
        
        # Analyze by category
        for data in self.training_data:
            category = data['category']
            if category not in analysis['categories']:
                analysis['categories'][category] = {'count': 0, 'characters': 0}
            analysis['categories'][category]['count'] += 1
            analysis['categories'][category]['characters'] += data['characters']
        
        # Analyze by source
        for data in self.training_data:
            source = data['source']
            if source not in analysis['sources']:
                analysis['sources'][source] = {'count': 0, 'characters': 0}
            analysis['sources'][source]['count'] += 1
            analysis['sources'][source]['characters'] += data['characters']
        
        # Generate insights
        analysis['insights'] = [
            f"Most productive category: {max(analysis['categories'].items(), key=lambda x: x[1]['characters'])[0]}",
            f"Most productive source: {max(analysis['sources'].items(), key=lambda x: x[1]['characters'])[0]}",
            f"Average content length: {analysis['total_characters'] / analysis['total_sources']:.0f} characters",
            f"Training data growth: {analysis['total_sources']} sources, {analysis['total_characters']} characters"
        ]
        
        logger.info(f"📊 Analysis completed: {analysis['total_sources']} sources, {analysis['total_characters']} characters")
        return analysis

    def generate_training_report(self):
        """Generate training report"""
        logger.info("📊 Generating training report...")
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_sources': len(self.training_data),
            'total_characters': sum(d['characters'] for d in self.training_data),
            'categories': list(self.sources.keys()),
            'training_stats': self.get_training_stats(),
            'recommendations': [
                "Continue training with diverse sources",
                "Focus on high-quality content sources",
                "Regularly update training data",
                "Monitor training effectiveness"
            ]
        }
        
        # Save report
        # Get project root (parent of 'scripts' directory)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        report_path = os.path.join(project_root, 'frontend', 'lib', 'training_report.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        logger.info(f"✅ Training report saved to: {report_path}")

    def save_training_data(self):
        """Save training data to file"""
        try:
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
            
            # Get project root (parent of 'scripts' directory)
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(script_dir)
            file_path = os.path.join(project_root, 'frontend', 'lib', 'comprehensiveTrainingData.js')
            
            file_content = f"""// Comprehensive Training Data - Generated {datetime.now().isoformat()}
// Total Sources: {integrated_data['total_sources']}
// Total Characters: {integrated_data['total_characters']}

export const comprehensiveTrainingData = {json.dumps(integrated_data, indent=2)};

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
    """Main function to start continuous training"""
    trainer = ContinuousAITrainer()
    
    print("🚀 Starting Continuous AI Training System...")
    print("=" * 80)
    print("📚 Training Categories:")
    print("🔮 Astrology - Vedic, Classical, Modern")
    print("🕉️ Religious - Hinduism, Philosophy, Spirituality")
    print("📖 Classical - Mahabharat, Ramayan, Gita, Puranas")
    print("📚 Sanskrit - Language, Literature, Grammar")
    print("🇳🇵 Nepali - Swosthani, Local Traditions")
    print("🕉️ Vedic - Ancient Texts, Philosophy, Culture")
    print("=" * 80)
    print("⏰ Training Schedule:")
    print("🔄 Every 6 hours - Quick training cycle")
    print("🌙 Daily at 2 AM - Full training cycle")
    print("📅 Weekly on Sunday at 3 AM - Comprehensive training cycle")
    print("=" * 80)
    
    try:
        trainer.start_continuous_training()
    except KeyboardInterrupt:
        print("\n🛑 Continuous training stopped by user")
    except Exception as error:
        print(f"\n❌ Error in continuous training: {error}")

if __name__ == "__main__":
    main()
