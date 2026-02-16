import { NextResponse } from 'next/server';

// AI Chatbot API endpoint
export async function POST(request) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ 
        error: 'Message is required' 
      }, { status: 400 });
    }

    // Generate intelligent AI response
    const aiResponse = await generateAIResponse(message, conversationHistory);

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process message' 
    }, { status: 500 });
  }
}

async function generateAIResponse(message, conversationHistory) {
  const userMessage = message.toLowerCase().trim();
  
  // Enhanced keyword detection with more specific terms
  const gemstoneKeywords = ['gemstone', 'stone', 'ratna', 'precious stone', 'crystal', 'ruby', 'emerald', 'diamond', 'sapphire', 'pearl', 'coral', 'topaz', 'garnet', 'amethyst', 'citrine', 'moonstone', 'hessonite', 'cat\'s eye', 'blue sapphire', 'yellow sapphire', 'red coral', 'white pearl', 'green emerald', 'birthstone'];
  const zodiacKeywords = ['capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'zodiac', 'sun sign', 'star sign', 'horoscope sign'];
  const astrologyKeywords = ['kundli', 'horoscope', 'astrology', 'birth chart', 'rasi', 'nakshatra', 'panchang', 'muhurat', 'dasha', 'yoga', 'planet', 'zodiac', 'star', 'moon', 'sun', 'mars', 'venus', 'jupiter', 'saturn', 'mercury', 'rahu', 'ketu', 'ascendant', 'lagna', 'house', 'bhava'];
  const spiritualKeywords = ['puja', 'worship', 'temple', 'god', 'goddess', 'prayer', 'meditation', 'spiritual', 'dharma', 'karma', 'moksha', 'vedic', 'hindu', 'festival', 'ritual', 'mantra', 'chakra', 'pooja', 'havan', 'jaap', 'blessing', 'deity', 'divine', 'color', 'lucky', 'feng shui', 'energy', 'prosperity', 'healing', 'confidence', 'chanting', 'navagraha', 'planetary', 'surya', 'chandra', 'mangal', 'budha', 'brihaspati', 'shukra', 'shani', 'rahu', 'ketu', 'mala', 'beads', 'dosh', 'dosha', 'dosh', 'remedy', 'remedies', 'affliction', 'malefic', 'graha', 'beej', 'stotra', 'hridayam', 'chalisa', 'sahasranamam', 'shanti', 'yantra', 'navadhanya', 'homa', 'fire ceremony', 'ganapati', 'ganesha'];
  const generalKeywords = ['hello', 'hi', 'help', 'what', 'how', 'when', 'where', 'why', 'who', 'good', 'bad', 'yes', 'no', 'thanks', 'thank you', 'recommend', 'suggest', 'advice'];

  // Check conversation context
  const hasContext = conversationHistory.length > 0;
  const lastBotMessage = hasContext ? conversationHistory[conversationHistory.length - 1]?.text?.toLowerCase() || '' : '';

  // Generate intelligent, contextual responses
  if (gemstoneKeywords.some(keyword => userMessage.includes(keyword))) {
    return generateGemstoneResponse(userMessage, lastBotMessage);
  } else if (zodiacKeywords.some(keyword => userMessage.includes(keyword))) {
    return generateZodiacGemstoneResponse(userMessage, lastBotMessage);
  } else if (astrologyKeywords.some(keyword => userMessage.includes(keyword))) {
    return generateAstrologyResponse(userMessage, lastBotMessage);
  } else if (spiritualKeywords.some(keyword => userMessage.includes(keyword))) {
    return generateSpiritualResponse(userMessage, lastBotMessage);
  } else if (generalKeywords.some(keyword => userMessage.includes(keyword))) {
    return generateGeneralResponse(userMessage, lastBotMessage);
  } else {
    return generateIntelligentResponse(userMessage, lastBotMessage);
  }
}

function generateGemstoneResponse(message, lastBotMessage) {
  // Intelligent gemstone recommendations based on context
  if (message.includes('recommend') || message.includes('suggest')) {
    return `💎 Oh, I'd love to help you with gemstone recommendations! But here's the thing - I can't just randomly suggest stones to you. That would be like a doctor prescribing medicine without knowing your symptoms, you know?

For the best gemstone advice, I really need to see your birth chart first. Here's why:

1. Your birth chart shows which planets are strong or weak in your life
2. Different gemstones work for different planetary issues
3. Wearing the wrong gemstone can actually cause problems!

So here's what I suggest:
- First, create your Kundli using our system
- Then I can analyze your planetary positions
- Finally, I can recommend the right gemstones for you

Quick tip though - each planet has its own gemstone:
• Sun loves Ruby (Manik) - great for confidence and leadership
• Moon prefers Pearl (Moti) - helps with emotions and mind
• Mars likes Red Coral (Moonga) - gives courage and energy
• Mercury loves Emerald (Panna) - boosts communication
• Jupiter adores Yellow Sapphire (Pukhraj) - brings wisdom and prosperity
• Venus enjoys Diamond (Heera) - enhances love and beauty
• Saturn likes Blue Sapphire (Neelam) - but be careful with this one!

Want to create your Kundli first? Then I can give you personalized gemstone advice! 😊`;
  }

  if (message.includes('ruby') || message.includes('manik')) {
    return `🔴 Ah, Ruby! The king of gemstones! 😍

Ruby is the Sun's favorite stone, and let me tell you - it's powerful stuff! If you're feeling low on confidence, struggling with leadership, or just need that extra "oomph" in life, Ruby might be your best friend.

Here's what Ruby does for you:
• Boosts your confidence like crazy
• Makes you a natural leader
• Gives you authority and respect
• Increases your vitality and energy

How to wear it:
• Put it on your ring finger (right hand)
• Best day to start: Sunday (Sun's day, obviously!)
• Use gold setting (Sun loves gold)
• Size: 3, 5, or 7 carats works best
• Chant "Om Suryaya Namah" 108 times daily

But here's the thing - Ruby works best if you have a weak Sun in your birth chart. If your Sun is already strong, it might make you too aggressive! That's why I always say - check your birth chart first.

Want to know if Ruby is right for you? Create your Kundli and I'll tell you! 😊`;
  }

  if (message.includes('emerald') || message.includes('panna')) {
    return `💚 Oh, Emerald! My personal favorite! 😊

Emerald is Mercury's gemstone, and Mercury is the planet of communication, intelligence, and business. If you're a student, writer, or in business, Emerald is like having a superpower!

Here's what makes Emerald special:
• Makes you super smart and quick-witted
• Improves your communication skills
• Helps in business and financial matters
• Makes you a better speaker and writer

How to wear it:
• Little finger of your right hand
• Best day to start: Wednesday (Mercury's day)
• Gold or silver setting both work
• Size: 3, 5, or 7 carats
• Chant "Om Budhaya Namah" 108 times daily

I've seen people transform after wearing Emerald - they become more articulate, their business improves, and they just seem smarter overall! 

But remember, it works best if your Mercury needs strengthening. Want to check if Emerald is right for you? Create your Kundli and let's see! 😉`;
  }

  if (message.includes('sapphire') || message.includes('neelam') || message.includes('pukhraj')) {
    return `💙 Ah, Sapphires! Now we're talking about serious power! 😮

There are two types, and they're completely different:

**Yellow Sapphire (Pukhraj) - Jupiter's Stone:**
This is the "good luck" stone! Jupiter is the planet of wisdom, prosperity, and spirituality. If you want:
• More wisdom and knowledge
• Financial prosperity
• Children (if you're trying to conceive)
• Spiritual growth
Then Pukhraj is your friend!

Wear it on your index finger, start on Thursday, and you're good to go!

**Blue Sapphire (Neelam) - Saturn's Stone:**
Now this one is POWERFUL but tricky! Saturn is the planet of discipline, karma, and delays. Blue Sapphire can:
• Give you incredible discipline and patience
• Help with career success
• Bring financial stability
• But... it can also cause problems if not suited!

⚠️ **IMPORTANT**: Blue Sapphire is like a powerful medicine - it can cure or cause problems! Always test it for 3 days before permanent wearing.

My advice? Get proper astrological consultation before wearing any Sapphire. These aren't casual stones! 😅`;
  }

  return `💎 Hey there! I love talking about gemstones! 😊

I can definitely help you with gemstone recommendations, but here's the thing - I need to know more about you first. It's like being a doctor, you know? I can't just prescribe any medicine without knowing your condition!

To give you the best gemstone advice, I need to know:
1. Your birth details (so I can check your birth chart)
2. Which gemstone you're curious about
3. What's bothering you right now (health, career, relationships, etc.)

Here are the popular ones people ask about:
• Ruby (Sun) - For confidence and leadership
• Pearl (Moon) - For emotional balance
• Red Coral (Mars) - For courage and energy
• Emerald (Mercury) - For communication and intelligence
• Yellow Sapphire (Jupiter) - For wisdom and prosperity
• Diamond (Venus) - For love and luxury
• Blue Sapphire (Saturn) - For discipline and career

Want to tell me about a specific gemstone you're interested in? Or should we start by creating your Kundli so I can give you personalized recommendations? 😉`;
}

function generateZodiacGemstoneResponse(message, lastBotMessage) {
  // Zodiac sign gemstone recommendations
  if (message.includes('capricorn')) {
    return `🐐 **Capricorn Gemstones - Perfect for You!** 😊

Oh, Capricorn! You're such a determined and ambitious sign! Here are the gemstones that will work beautifully for you:

**🎯 Primary Gemstone - Garnet:**
• **Symbolizes**: Strength, courage, and true love
• **Perfect for**: Capricorns who need extra determination and courage
• **Benefits**: Enhances your natural leadership qualities and helps you stay focused on your goals
• **Wear on**: Ring finger of right hand
• **Best day**: Saturday (Saturn's day - your ruling planet!)

**🖤 Alternative Stone - Onyx:**
• **Symbolizes**: Strength, discipline, and protection
• **Perfect for**: When you need extra grounding and protection
• **Benefits**: Helps you stay disciplined and protects you from negative energies
• **Wear on**: Middle finger of right hand
• **Best day**: Saturday

**Why these stones work for Capricorns:**
Capricorns are ruled by Saturn, the planet of discipline and hard work. These stones help you channel that Saturn energy in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('aquarius')) {
    return `♒ **Aquarius Gemstones - Perfect for You!** 😊

Oh, Aquarius! You're such an innovative and humanitarian sign! Here are the gemstones that will enhance your unique energy:

**💜 Primary Gemstone - Amethyst:**
• **Symbolizes**: Wisdom, calmness, and spiritual growth
• **Perfect for**: Aquarians who want to enhance their intuition and spiritual awareness
• **Benefits**: Helps you stay calm in chaotic situations and enhances your natural wisdom
• **Wear on**: Middle finger of right hand
• **Best day**: Saturday (Saturn's day - your ruling planet!)

**❤️ Alternative Stone - Garnet:**
• **Symbolizes**: Success, energy, and passion
• **Perfect for**: When you need extra energy and motivation
• **Benefits**: Boosts your energy levels and helps you achieve your humanitarian goals
• **Wear on**: Ring finger of right hand
• **Best day**: Saturday

**Why these stones work for Aquarians:**
Aquarius is ruled by Saturn and Uranus, giving you that unique blend of discipline and innovation. These stones help you balance your humanitarian nature with your need for personal growth!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('pisces')) {
    return `♓ **Pisces Gemstones - Perfect for You!** 😊

Oh, Pisces! You're such a compassionate and intuitive sign! Here are the gemstones that will enhance your natural gifts:

**💙 Primary Gemstone - Aquamarine:**
• **Symbolizes**: Peace, serenity, and noble ideals
• **Perfect for**: Pisceans who want to enhance their natural peace and serenity
• **Benefits**: Helps you stay calm and centered, enhances your intuitive abilities
• **Wear on**: Little finger of right hand
• **Best day**: Thursday (Jupiter's day - your ruling planet!)

**💜 Alternative Stone - Amethyst:**
• **Symbolizes**: Spiritual awareness, rejuvenation, and peace
• **Perfect for**: When you need extra spiritual protection and awareness
• **Benefits**: Enhances your natural psychic abilities and provides spiritual protection
• **Wear on**: Middle finger of right hand
• **Best day**: Thursday

**Why these stones work for Pisceans:**
Pisces is ruled by Jupiter and Neptune, giving you that beautiful blend of wisdom and intuition. These stones help you channel your natural compassion and spiritual awareness!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('aries')) {
    return `♈ **Aries Gemstones - Perfect for You!** 😊

Oh, Aries! You're such a bold and energetic sign! Here are the gemstones that will enhance your natural fire:

**💎 Primary Gemstone - Diamond:**
• **Symbolizes**: Purity, strength, and courage
• **Perfect for**: Aries who want to enhance their natural leadership and courage
• **Benefits**: Amplifies your natural confidence and helps you take on new challenges
• **Wear on**: Ring finger of right hand
• **Best day**: Tuesday (Mars' day - your ruling planet!)

**🔴 Alternative Stone - Bloodstone:**
• **Symbolizes**: Energy, courage, and vitality
• **Perfect for**: When you need extra energy and motivation
• **Benefits**: Boosts your energy levels and helps you stay motivated
• **Wear on**: Ring finger of right hand
• **Best day**: Tuesday

**Why these stones work for Aries:**
Aries is ruled by Mars, the planet of energy and courage. These stones help you channel that Mars energy in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('taurus')) {
    return `♉ **Taurus Gemstones - Perfect for You!** 😊

Oh, Taurus! You're such a grounded and sensual sign! Here are the gemstones that will enhance your natural stability:

**💚 Primary Gemstone - Emerald:**
• **Symbolizes**: Growth, prosperity, and emotional healing
• **Perfect for**: Taurus who want to enhance their natural prosperity and emotional balance
• **Benefits**: Helps you attract abundance and heal emotional wounds
• **Wear on**: Little finger of right hand
• **Best day**: Friday (Venus' day - your ruling planet!)

**💙 Alternative Stone - Sapphire:**
• **Symbolizes**: Wisdom, loyalty, and purity
• **Perfect for**: When you need extra wisdom and loyalty in relationships
• **Benefits**: Enhances your natural loyalty and helps you make wise decisions
• **Wear on**: Middle finger of right hand
• **Best day**: Friday

**Why these stones work for Taurus:**
Taurus is ruled by Venus, the planet of love and beauty. These stones help you channel that Venus energy in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('gemini')) {
    return `♊ **Gemini Gemstones - Perfect for You!** 😊

Oh, Gemini! You're such a curious and communicative sign! Here are the gemstones that will enhance your natural gifts:

**🤍 Primary Gemstone - Pearl:**
• **Symbolizes**: Purity, wisdom, and honesty
• **Perfect for**: Gemini who want to enhance their natural communication and wisdom
• **Benefits**: Helps you communicate more clearly and enhances your natural curiosity
• **Wear on**: Little finger of right hand
• **Best day**: Wednesday (Mercury's day - your ruling planet!)

**🌈 Alternative Stone - Agate:**
• **Symbolizes**: Mental clarity and communication skills
• **Perfect for**: When you need extra mental clarity and focus
• **Benefits**: Enhances your natural communication skills and helps you stay focused
• **Wear on**: Little finger of right hand
• **Best day**: Wednesday

**Why these stones work for Gemini:**
Gemini is ruled by Mercury, the planet of communication and intelligence. These stones help you channel that Mercury energy in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('cancer')) {
    return `♋ **Cancer Gemstones - Perfect for You!** 😊

Oh, Cancer! You're such a nurturing and intuitive sign! Here are the gemstones that will enhance your natural gifts:

**❤️ Primary Gemstone - Ruby:**
• **Symbolizes**: Love, passion, and protection
• **Perfect for**: Cancer who want to enhance their natural nurturing and protective qualities
• **Benefits**: Helps you protect your loved ones and enhances your natural emotional depth
• **Wear on**: Ring finger of right hand
• **Best day**: Monday (Moon's day - your ruling planet!)

**🌙 Alternative Stone - Moonstone:**
• **Symbolizes**: Intuition and emotional balance
• **Perfect for**: When you need extra intuition and emotional balance
• **Benefits**: Enhances your natural psychic abilities and helps you stay emotionally balanced
• **Wear on**: Ring finger of right hand
• **Best day**: Monday

**Why these stones work for Cancer:**
Cancer is ruled by the Moon, the planet of emotions and intuition. These stones help you channel that Moon energy in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('leo')) {
    return `♌ **Leo Gemstones - Perfect for You!** 😊

Oh, Leo! You're such a confident and creative sign! Here are the gemstones that will enhance your natural radiance:

**💚 Primary Gemstone - Peridot:**
• **Symbolizes**: Strength, success, and prosperity
• **Perfect for**: Leo who want to enhance their natural leadership and success
• **Benefits**: Helps you achieve your goals and enhances your natural charisma
• **Wear on**: Ring finger of right hand
• **Best day**: Sunday (Sun's day - your ruling planet!)

**🖤 Alternative Stone - Onyx:**
• **Symbolizes**: Self-confidence and strength
• **Perfect for**: When you need extra confidence and strength
• **Benefits**: Boosts your self-confidence and helps you stay grounded
• **Wear on**: Middle finger of right hand
• **Best day**: Sunday

**Why these stones work for Leo:**
Leo is ruled by the Sun, the planet of confidence and leadership. These stones help you channel that Sun energy in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('virgo')) {
    return `♍ **Virgo Gemstones - Perfect for You!** 😊

Oh, Virgo! You're such a practical and analytical sign! Here are the gemstones that will enhance your natural gifts:

**💙 Primary Gemstone - Blue Sapphire:**
• **Symbolizes**: Wisdom, loyalty, and purity
• **Perfect for**: Virgo who want to enhance their natural wisdom and analytical skills
• **Benefits**: Helps you make better decisions and enhances your natural attention to detail
• **Wear on**: Middle finger of right hand
• **Best day**: Wednesday (Mercury's day - your ruling planet!)

**🧡 Alternative Stone - Carnelian:**
• **Symbolizes**: Grounding and analytical skills
• **Perfect for**: When you need extra grounding and focus
• **Benefits**: Enhances your natural analytical abilities and helps you stay focused
• **Wear on**: Ring finger of right hand
• **Best day**: Wednesday

**Why these stones work for Virgo:**
Virgo is ruled by Mercury, the planet of intelligence and analysis. These stones help you channel that Mercury energy in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('libra')) {
    return `♎ **Libra Gemstones - Perfect for You!** 😊

Oh, Libra! You're such a balanced and harmonious sign! Here are the gemstones that will enhance your natural gifts:

**🌈 Primary Gemstone - Opal:**
• **Symbolizes**: Harmony, creativity, and balance
• **Perfect for**: Libra who want to enhance their natural sense of balance and harmony
• **Benefits**: Helps you maintain balance in relationships and enhances your natural creativity
• **Wear on**: Ring finger of right hand
• **Best day**: Friday (Venus' day - your ruling planet!)

**💚 Alternative Stone - Peridot:**
• **Symbolizes**: Harmony and balance
• **Perfect for**: When you need extra harmony and balance
• **Benefits**: Enhances your natural sense of justice and helps you maintain balance
• **Wear on**: Ring finger of right hand
• **Best day**: Friday

**Why these stones work for Libra:**
Libra is ruled by Venus, the planet of love and beauty. These stones help you channel that Venus energy in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('scorpio')) {
    return `♏ **Scorpio Gemstones - Perfect for You!** 😊

Oh, Scorpio! You're such an intense and transformative sign! Here are the gemstones that will enhance your natural power:

**💛 Primary Gemstone - Topaz:**
• **Symbolizes**: Personal strength and emotional healing
• **Perfect for**: Scorpio who want to enhance their natural strength and healing abilities
• **Benefits**: Helps you transform negative energy into positive and enhances your natural intensity
• **Wear on**: Ring finger of right hand
• **Best day**: Tuesday (Mars' day - your ruling planet!)

**🧡 Alternative Stone - Citrine:**
• **Symbolizes**: Transformation and positive energy
• **Perfect for**: When you need to transform negative feelings into positive energy
• **Benefits**: Helps you stay positive and transforms negative energy into positive
• **Wear on**: Ring finger of right hand
• **Best day**: Tuesday

**Why these stones work for Scorpio:**
Scorpio is ruled by Mars and Pluto, giving you that intense transformative energy. These stones help you channel that power in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  if (message.includes('sagittarius')) {
    return `♐ **Sagittarius Gemstones - Perfect for You!** 😊

Oh, Sagittarius! You're such an adventurous and philosophical sign! Here are the gemstones that will enhance your natural gifts:

**💙 Primary Gemstone - Tanzanite (Western):**
• **Symbolizes**: Adventure and spiritual growth
• **Perfect for**: Sagittarius who want to enhance their natural adventurous spirit
• **Benefits**: Helps you on your spiritual journey and enhances your natural optimism
• **Wear on**: Ring finger of right hand
• **Best day**: Thursday (Jupiter's day - your ruling planet!)

**🦋 Alternative Stone - Turquoise:**
• **Symbolizes**: Protection and communication
• **Perfect for**: When you need extra protection during your adventures
• **Benefits**: Protects you during travels and enhances your natural communication skills
• **Wear on**: Ring finger of right hand
• **Best day**: Thursday

**💛 Vedic Recommendation - Yellow Sapphire:**
• **Symbolizes**: Wisdom, prosperity, and spiritual growth
• **Perfect for**: Sagittarius who want to enhance their natural wisdom and prosperity
• **Benefits**: Helps you achieve your goals and enhances your natural philosophical nature
• **Wear on**: Index finger of right hand
• **Best day**: Thursday

**Why these stones work for Sagittarius:**
Sagittarius is ruled by Jupiter, the planet of wisdom and expansion. These stones help you channel that Jupiter energy in the most positive way!

Want to know more about how to wear these stones or when to start wearing them? I'd love to help you! 😊`;
  }

  // General zodiac gemstone response
  if (message.includes('zodiac') || message.includes('sun sign') || message.includes('star sign') || message.includes('horoscope sign')) {
    return `🌟 Oh, zodiac gemstones! This is such a fun topic! 😊

I'd love to help you find the perfect gemstone for your zodiac sign! Each sign has its own special stones that can enhance your natural qualities.

**To give you the best recommendation, I need to know:**
What's your zodiac sign? Just tell me your sign and I'll give you personalized gemstone advice!

**Here are the zodiac signs I can help with:**
• Capricorn (Dec 22–Jan 19)
• Aquarius (Jan 20–Feb 18)
• Pisces (Feb 19–Mar 20)
• Aries (Mar 21–Apr 19)
• Taurus (Apr 20–May 20)
• Gemini (May 21–Jun 20)
• Cancer (Jun 21–Jul 22)
• Leo (Jul 23–Aug 22)
• Virgo (Aug 23–Sep 22)
• Libra (Sep 23–Oct 22)
• Scorpio (Oct 23–Nov 21)
• Sagittarius (Nov 22–Dec 21)

**What makes zodiac gemstones special:**
Each sign has traditional birthstones that are believed to enhance your natural qualities and bring you luck, protection, and positive energy!

Just tell me your zodiac sign and I'll give you detailed information about your perfect gemstones! 😊`;
  }

  return `🌟 Oh, zodiac gemstones! This is such a fascinating topic! 😊

I'd love to help you find the perfect gemstone for your zodiac sign! Each sign has its own special stones that can enhance your natural qualities.

**To give you the best recommendation, I need to know:**
What's your zodiac sign? Just tell me your sign and I'll give you personalized gemstone advice!

**Here are the zodiac signs I can help with:**
• Capricorn (Dec 22–Jan 19)
• Aquarius (Jan 20–Feb 18)
• Pisces (Feb 19–Mar 20)
• Aries (Mar 21–Apr 19)
• Taurus (Apr 20–May 20)
• Gemini (May 21–Jun 20)
• Cancer (Jun 21–Jul 22)
• Leo (Jul 23–Aug 22)
• Virgo (Aug 23–Sep 22)
• Libra (Sep 23–Oct 22)
• Scorpio (Oct 23–Nov 21)
• Sagittarius (Nov 22–Dec 21)

**What makes zodiac gemstones special:**
Each sign has traditional birthstones that are believed to enhance your natural qualities and bring you luck, protection, and positive energy!

Just tell me your zodiac sign and I'll give you detailed information about your perfect gemstones! 😊`;
}

function generateAstrologyResponse(message, lastBotMessage) {
  // More intelligent and contextual astrology responses
  if (message.includes('kundli') || message.includes('birth chart')) {
    return `🎯 Oh, you want to create your Kundli! That's awesome! 😊

Creating your Kundli is like getting a complete roadmap of your life. It's fascinating, really! Here's how we do it:

1. First, go to our Kundli section on the platform
2. You'll need to provide your exact birth details:
   - Your birth date
   - Your birth time (this is SUPER important!)
   - Your birth place
3. Our VedicJyotish system will then create your complete birth chart

Now, here's why birth time is so crucial - it's like the difference between a blurry photo and a crystal clear one! Your birth time determines:
• Your Ascendant (Lagna) - your personality mask
• Where each planet was positioned when you were born
• Which houses they're in
• Your Dasha periods (life phases)

I've seen people get completely different readings just because their birth time was off by 30 minutes! That's how precise this is.

Want me to walk you through creating your Kundli? It's actually pretty exciting once you see all the details! 😉`;
  }
  
  if (message.includes('horoscope') || message.includes('prediction')) {
    return `🔮 Ah, predictions! Everyone wants to know what the future holds, right? 😊

Here's the thing about predictions - they're only as good as the system used to make them. And that's where we shine! 

For the most accurate predictions, here's what I suggest:
1. First, create your detailed Kundli (this is the foundation!)
2. Check our daily horoscope section for general guidance
3. Use our VedicJyotish system for the real deal:
   - Current planetary transits (what planets are doing right now)
   - Dasha period analysis (your life phases)
   - Monthly/yearly predictions
   - Auspicious timings for important events

What makes our predictions special? Well, we don't just guess! We use:
• Vedic astrology principles (ancient wisdom that works!)
• Swiss Ephemeris calculations (super precise!)
• Dasha periods and transits (the real movers and shakers)
• Remedial measures (what to do if things aren't going well)

I've seen people's lives change after following our predictions and remedies. It's pretty amazing, actually!

Want to explore our horoscope services? Or should we start by creating your Kundli for some personalized predictions? 😉`;
  }
  
  if (message.includes('dasha') || message.includes('period')) {
    return `⏰ Oh, Dasha periods! This is where astrology gets really interesting! 😮

Think of Dasha periods as the "seasons" of your life. Just like how nature has different seasons, your life has different planetary influences at different times.

Here's how it works:
**Major Dasha (Maha Dasha) - The Big Picture:**
• Sun: 6 years (like a bright, energetic summer)
• Moon: 10 years (emotional, nurturing phase)
• Mars: 7 years (action-packed, energetic time)
• Mercury: 17 years (communication, business focus)
• Jupiter: 16 years (wisdom, growth, prosperity)
• Venus: 20 years (love, beauty, luxury)
• Saturn: 19 years (discipline, hard work, but also rewards)

**Why this matters:**
• It tells you which planet is "running the show" in your life right now
• Predicts when good or challenging times will come
• Helps you make important decisions at the right time
• Shows you what to focus on during each period

I've seen people completely transform their lives by understanding their Dasha periods! It's like having a roadmap for your life.

Want to know what Dasha period you're in right now? Create your Kundli and I'll tell you all about it! 😊`;
  }

  if (message.includes('planet') || message.includes('graha')) {
    return `🪐 Oh, planets! This is where the magic happens! 😍

Each planet is like a different character in the story of your life. They all have their own personalities and influence different parts of your life:

**The Main Characters:**
• **Sun (Surya)** - The king! Rules your soul, authority, father, and government
• **Moon (Chandra)** - The queen! Controls your mind, mother, emotions, and public image
• **Mars (Mangal)** - The warrior! Gives you energy, courage, siblings, and property
• **Mercury (Budh)** - The messenger! Handles intelligence, communication, and business
• **Jupiter (Guru)** - The teacher! Brings wisdom, children, wealth, and spirituality
• **Venus (Shukra)** - The lover! Rules love, beauty, spouse, and luxury
• **Saturn (Shani)** - The disciplinarian! Teaches discipline, karma, and gives longevity

**The Shadow Players:**
• **Rahu** - The trickster! Creates desires and foreign connections
• **Ketu** - The spiritual one! Brings spirituality and detachment

Here's the cool part - depending on where these planets are in your birth chart, they can be your best friends or your biggest challenges! 

Want to know which planets are strong in your chart? Create your Kundli and I'll tell you all about your planetary team! 😊`;
  }

  return `🌟 Hey there! I absolutely love talking about Vedic astrology! 😊

It's such a fascinating science, you know? It's like having a blueprint of your life written in the stars. I can help you understand all the amazing things it can tell you:

**📊 Birth Chart Analysis:**
• Your Rasi (Moon sign) - your emotional nature
• Your Nakshatra (birth star) - your spiritual DNA
• Where all the planets were when you were born
• Your house placements (different life areas)

**🔮 Predictive Astrology:**
• Your Dasha periods (life phases)
• What planets are doing right now
• The best times for important decisions
• When good or challenging times will come

**🛠️ Remedial Measures:**
• Which gemstones will help you
• Mantras to chant for specific benefits
• Puja and rituals for different purposes
• Spiritual practices tailored to your chart

I've been studying this for a long time, and I'm still amazed by how accurate it can be! The ancient sages really knew what they were doing.

What aspect of astrology interests you most? I can explain anything you want to know, or we can start by creating your Kundli to see what the stars have to say about you! 😉`;
}

function generateSpiritualResponse(message, lastBotMessage) {
  if (message.includes('puja') || message.includes('worship') || message.includes('pooja')) {
    return `🕉️ Oh, Pooja! This is such a beautiful and powerful practice! 😊

Pooja is a sacred Hindu ritual of worship that involves prayers, offerings, and mantras to honor deities and seek divine blessings. It's like having a direct conversation with the divine!

**🌟 For Good Health and Healing:**
• **Dhanvantri Pooja or Havan**: Lord Dhanvantri is the divine physician! This ritual is perfect for seeking blessings for good health and relief from chronic illnesses.
• **Maha Mrityunjaya Jaap**: This powerful mantra dedicated to Lord Shiva protects against untimely death, diseases, and negative influences. It's incredibly powerful!
• **Ayush Havan**: This Vedic ritual is often performed for children and elders to seek blessings for a long, healthy life.

**🚀 For Removing Obstacles and Success:**
• **Ganesha Puja**: Lord Ganesha is the remover of all obstacles! This is traditionally the first step in any new endeavor.
• **Hanuman Puja**: Worshipping Lord Hanuman helps gain strength, vitality, and courage to overcome challenges. Perfect for when you need extra energy!

**💰 For Prosperity and Abundance:**
• **Lakshmi Puja**: This puja invokes Goddess Lakshmi, the goddess of wealth and prosperity. It's commonly done during Diwali and other festivals.
• **Lord Kuber Puja**: Lord Kuber is the treasurer of the gods! This puja seeks his blessings for unlimited wealth and riches.

**☮️ For Harmonizing Energies and Peace:**
• **Navagraha Havan or Puja**: This pacifies the nine planets and neutralizes their negative effects, which can influence health and well-being.
• **Vastu Shanti Pooja**: This ritual harmonizes the energies of your home or workspace, ensuring peace and prosperity.

**🌅 For Daily Practice:**
A simple daily puja can involve:
• Cleaning the space
• Lighting a lamp and incense
• Offering flowers
• Chanting key mantras like the Gayatri Mantra
• Focusing on your Ishta Devata (chosen deity)

What specific type of pooja are you interested in? I'd love to help you with detailed guidance! 😊`;
  }

  if (message.includes('health') || message.includes('healing') || message.includes('illness') || message.includes('disease')) {
    return `🏥 Oh, health and healing poojas! These are so powerful and transformative! 😊

When it comes to health, there are some incredibly powerful poojas that can bring amazing results:

**🩺 Dhanvantri Pooja or Havan:**
• **Who**: Lord Dhanvantri - the divine physician
• **Perfect for**: Seeking blessings for good health and relief from chronic illnesses
• **Benefits**: Helps with healing, recovery, and overall well-being
• **Best time**: Any day, but especially during Dhanvantri Jayanti
• **Special note**: This ritual specifically seeks blessings for good health and relief from chronic illnesses

**🕉️ Maha Mrityunjaya Jaap:**
• **Who**: Lord Shiva - the destroyer of death
• **Perfect for**: Protection against illness, misfortune, and untimely death
• **Benefits**: Incredibly powerful for health protection, especially during critical illness or surgery
• **Best time**: Any day, but especially on Mondays and during Shivratri
• **Special note**: This mantra is highly recommended during critical illness or surgery

**🌿 Ayush Havan:**
• **Who**: Vedic ritual for longevity
• **Perfect for**: Children and elders seeking long, healthy life
• **Benefits**: Blessings for a long, healthy life
• **Best time**: Any auspicious day, especially on birthdays
• **Special note**: Often performed on birthdays, especially for children and the elderly

**💡 Pro Tip**: These poojas work best when combined with proper medical treatment. They're not replacements for medical care, but powerful spiritual support!

Would you like me to explain any of these poojas in more detail? I'd love to help you choose the right one for your needs! 😊`;
  }

  if (message.includes('obstacle') || message.includes('success') || message.includes('challenge') || message.includes('problem')) {
    return `🚀 Oh, obstacle removal poojas! These are game-changers! 😊

When you're facing challenges or need success, these poojas can be incredibly powerful:

**🐘 Ganesha Puja:**
• **Who**: Lord Ganesha - the remover of all obstacles
• **Perfect for**: Any new endeavor or when facing obstacles
• **Benefits**: Removes all obstacles, brings success, and ensures smooth progress
• **Best time**: Any day, but especially on Tuesdays and during Ganesh Chaturthi
• **Special note**: Traditionally performed before any new endeavor, as he brings good luck

**🐒 Hanuman Puja:**
• **Who**: Lord Hanuman - the embodiment of strength and devotion
• **Perfect for**: Gaining strength, vitality, and courage to overcome challenges
• **Benefits**: Superhuman strength, courage, and protection from negative energies
• **Best time**: Any day, but especially on Tuesdays and Saturdays
• **Special note**: Reciting the Hanuman Chalisa can also strengthen mental health

**🕉️ Baglamukhi All Obstacle Removal Puja:**
• **Who**: Maa Baglamukhi - the goddess of protection
• **Perfect for**: Eliminating all hindrances and negative influences
• **Benefits**: Seeks to eliminate all hindrances and negative influences affecting your progress
• **Best time**: Any day, but especially on Tuesdays
• **Special note**: This puja is incredibly powerful for removing all types of obstacles

**💪 Why these work:**
• Ganesha removes obstacles before they even appear
• Hanuman gives you the strength to face any challenge
• Baglamukhi eliminates all negative influences
• All three are incredibly powerful and respond quickly to sincere devotion

**💡 Pro Tip**: Start with Ganesha Puja for any new venture, then add Hanuman Puja if you need extra strength, and Baglamukhi Puja for serious obstacles!

Which obstacle are you facing? I'd love to help you choose the perfect pooja! 😊`;
  }

  if (message.includes('prosperity') || message.includes('wealth') || message.includes('money') || message.includes('abundance')) {
    return `💰 Oh, prosperity poojas! These can truly transform your financial situation! 😊

When it comes to wealth and abundance, these poojas are incredibly powerful:

**🕉️ Lakshmi Puja:**
• **Who**: Goddess Lakshmi - the goddess of wealth, fortune, and prosperity
• **Perfect for**: Invoking wealth, prosperity, and abundance
• **Benefits**: Attracts wealth, removes financial obstacles, and brings prosperity
• **Best time**: Any day, but especially on Fridays and during Diwali
• **Special note**: Commonly done during festivals like Diwali to attract financial stability

**👑 Lord Kuber Puja:**
• **Who**: Lord Kuber - the treasurer of the gods
• **Perfect for**: Seeking unlimited wealth and riches
• **Benefits**: Blessings for unlimited wealth, financial stability, and abundance
• **Best time**: Any day, but especially on Fridays
• **Special note**: Lord Kuber is the actual treasurer of the gods - he controls all wealth!

**🎊 Dhanteras Puja:**
• **Who**: Goddess Lakshmi, Lord Kuber, and Lord Dhanvantri
• **Perfect for**: Inviting wealth, health, and prosperity
• **Benefits**: Celebrates the first day of Diwali with triple blessings
• **Best time**: Celebrated on the first day of Diwali
• **Special note**: This ritual worships three powerful deities together for maximum effect

**🌟 Why these work:**
• Lakshmi brings wealth through grace and blessings
• Kuber is the actual treasurer of the gods - he controls all wealth!
• Dhanteras combines wealth, health, and prosperity in one powerful ritual
• All three work together to create a powerful wealth-attracting energy

**💡 Pro Tip**: Combine all three poojas for maximum effect! Also, remember that wealth comes through both spiritual blessings and practical action!

What's your financial goal? I'd love to help you choose the right pooja for your situation! 😊`;
  }

  if (message.includes('peace') || message.includes('harmony') || message.includes('energy') || message.includes('balance')) {
    return `☮️ Oh, peace and harmony poojas! These are so beautiful and transformative! 😊

When you need peace, harmony, and balanced energies, these poojas are perfect:

**🪐 Navagraha Puja:**
• **Who**: The nine celestial planets (Navagrahas)
• **Perfect for**: Appeasing the nine planets to reduce their malefic effects
• **Benefits**: Increases positive influences, addresses issues related to health, business, career, and relationships
• **Best time**: Any day, but especially during planetary transits
• **Special note**: This puja can address issues related to health, business, career, and relationships

**🏠 Vastu Shanti Pooja:**
• **Who**: Vastu Purush (the deity of architecture)
• **Perfect for**: Harmonizing the energies of your home or workspace
• **Benefits**: Brings peace, prosperity, and removes Vastu doshas (architectural flaws that cause negative energy)
• **Best time**: Any auspicious day, especially during housewarming or renovation
• **Special note**: This ritual harmonizes energies by appeasing the Vastu Purush

**🌅 Daily Peace Practice:**
• **Clean the space**: Ensure your puja area is clean and clutter-free to allow positive energy to flow
• **Light a lamp and incense**: Light a ghee diya (lamp) and some incense to purify the surroundings and set a divine atmosphere
• **Offerings**: Offer fresh flowers, fruits, and sweets to your chosen deity
• **Chant a mantra**: Recite a mantra such as the Gayatri Mantra or one specific to your chosen deity with focus and dedication
• **Aarti and prasad**: Conclude with aarti and distribute the prasad (offering)

**💡 Pro Tip**: These poojas work best when done regularly. Peace is not a one-time thing - it's a practice!

What kind of peace are you seeking? I'd love to help you create the perfect peaceful practice! 😊`;
  }

  if (message.includes('daily') || message.includes('simple') || message.includes('routine') || message.includes('practice')) {
    return `🌅 Oh, daily pooja practice! This is such a beautiful way to start your day! 😊

A simple daily pooja can transform your entire day and bring so much peace and positivity into your life:

**🧹 Step 1: Clean the Space**
• Ensure your puja area is clean and clutter-free
• This allows positive energy to flow freely
• A clean space creates a sacred atmosphere

**🕯️ Step 2: Light a Lamp and Incense**
• Light a ghee diya (lamp) to purify the surroundings
• Light some incense to set a divine atmosphere
• The flame represents the divine light within you

**🌸 Step 3: Offerings**
• Offer fresh flowers to your chosen deity
• Offer fruits and sweets as prasad
• These offerings show your devotion and gratitude

**🕉️ Step 4: Chant a Mantra**
• Recite the Gayatri Mantra or a mantra specific to your chosen deity
• Chant with focus and dedication
• Feel the vibrations of the sacred sounds

**🔄 Step 5: Aarti and Prasad**
• Conclude with aarti (circular motion with the lamp)
• Distribute the prasad (offering) to family members
• This completes the cycle of giving and receiving

**💡 Pro Tips for Daily Practice:**
• **Consistency is key**: Even 10 minutes daily is better than hours once a week
• **Choose your deity**: Focus on your Ishta Devata (chosen deity) for deeper connection
• **Morning practice**: Start your day with pooja for positive energy throughout the day
• **Evening practice**: End your day with gratitude and peace

**🌟 Benefits of Daily Pooja:**
• Brings peace and calmness to your mind
• Creates positive energy in your home
• Strengthens your spiritual connection
• Helps you start each day with gratitude and purpose

Would you like me to help you set up a daily pooja routine? I'd love to guide you through creating your perfect practice! 😊`;
  }

  if (message.includes('color') || message.includes('lucky') || message.includes('feng shui') || message.includes('energy')) {
    return `🌈 Oh, lucky colors! This is such a fascinating and powerful topic! 😊

Colors have incredible energy and can truly transform your life! Based on ancient practices like Feng Shui and color psychology, certain colors can attract positive energy, prosperity, and emotional well-being.

**💰 For Prosperity and Abundance:**
• **Gold and Yellow**: Symbolize wealth, success, and prosperity. Gold represents luxury and success, while yellow evokes optimism and high achievement!
• **Green**: Represents growth, nature, and new beginnings - perfect for financial success and new opportunities!
• **Red and Purple**: According to Feng Shui, these are powerful colors for attracting wealth and financial success. Red symbolizes good fortune, while purple is associated with nobility and abundance!
• **Black**: Signifies stability and career opportunities, providing a solid foundation for finances!

**🏥 For Health and Healing:**
• **Green**: The most relaxing color for the human eye! It's a universal healing color associated with life, nature, and emotional balance.
• **Blue**: Evokes calmness, tranquility, and peace, helping to reduce stress and promote relaxation.
• **Yellow**: Often associated with the sun, yellow brings optimism and joy, which can positively impact mental health!
• **Orange**: Some believe orange has healing power that can help with depression and mental illness.
• **White**: Symbolizes purity, clarity, and new beginnings. In a healing context, it can strengthen your aura and protection!
• **Pink**: Inspires hope and symbolizes good health - like the phrase "in the pink"!

**🚀 For Confidence and Energy:**
• **Red**: A powerful, energetic color that boosts confidence, inspires action, and encourages enthusiasm!
• **Orange**: Combines the energy of red with the happiness of yellow, boosting confidence in social situations and promoting optimism!
• **Yellow**: Represents cheerfulness, optimism, and mental clarity. It can uplift your mood and inspire confidence!
• **Black**: Conveys prestige and authority, signaling controlled power and sophistication. It's believed to improve strength and self-confidence!
• **Gold**: Embodies confidence, success, and vitality. For some, it's the best color for fortune and helps amplify charisma and magnetism!

**💡 How to Use Lucky Colors:**
• **In your environment**: Use these colors in your home or office decor to influence the atmosphere
• **In your wardrobe**: Wear clothing or accessories in colors that align with your intentions for the day
• **In accessories**: Add touches of your lucky color through items like wallets, phone covers, or jewelry

What area of your life would you like to enhance with colors? I'd love to help you choose the perfect colors for your goals! 😊`;
  }

  if (message.includes('prosperity') && message.includes('color')) {
    return `💰 Oh, prosperity colors! These are so powerful for attracting wealth and abundance! 😊

When it comes to prosperity and abundance, these colors are incredibly effective:

**🥇 Gold:**
• **Symbolizes**: Luxury, success, and wealth
• **Perfect for**: High-value opportunities and prestige
• **How to use**: Gold jewelry, accessories, or accents in your workspace
• **Energy**: Embodies confidence, success, and vitality

**🟡 Yellow:**
• **Symbolizes**: Wealth, success, and prosperity
• **Perfect for**: Evoking optimism and high achievement
• **How to use**: Yellow accents in your office or yellow clothing for important meetings
• **Energy**: Brings cheerfulness, optimism, and mental clarity

**🟢 Green:**
• **Symbolizes**: Growth, nature, and new beginnings
• **Perfect for**: Financial success and new opportunities
• **How to use**: Green plants in your workspace or green accessories
• **Energy**: Represents growth and aligns with financial success

**🔴 Red:**
• **Symbolizes**: Good fortune and financial success
• **Perfect for**: Attracting wealth and financial success
• **How to use**: Red accents in your home or red clothing for important financial decisions
• **Energy**: Powerful and energetic, boosts confidence and inspires action

**🟣 Purple:**
• **Symbolizes**: Nobility and abundance
• **Perfect for**: Attracting wealth and financial success
• **How to use**: Purple accents in your workspace or purple accessories
• **Energy**: Associated with nobility and abundance

**⚫ Black:**
• **Symbolizes**: Stability and career opportunities
• **Perfect for**: Providing a solid foundation for finances
• **How to use**: Black clothing for important meetings or black accents in your office
• **Energy**: Conveys prestige and authority, signaling controlled power

**💡 Pro Tips:**
• Combine multiple prosperity colors for maximum effect
• Use these colors in your workspace to create a wealth-attracting environment
• Wear these colors when making important financial decisions
• Add these colors to your home decor to create a prosperous atmosphere

What's your financial goal? I'd love to help you choose the perfect prosperity colors for your situation! 😊`;
  }

  if (message.includes('health') && message.includes('color')) {
    return `🏥 Oh, healing colors! These are so powerful for health and well-being! 😊

When it comes to health and healing, these colors are incredibly effective:

**🟢 Green:**
• **Symbolizes**: Life, renewal, and nature
• **Perfect for**: Universal healing and emotional balance
• **How to use**: Green plants in your home, green clothing, or green accents in your bedroom
• **Energy**: The most relaxing color for the human eye, brings balance and harmony

**🔵 Blue:**
• **Symbolizes**: Calmness, tranquility, and peace
• **Perfect for**: Reducing stress and promoting relaxation
• **How to use**: Blue bedding, blue clothing, or blue accents in your bedroom
• **Energy**: Evokes calmness and helps reduce stress

**🟡 Yellow:**
• **Symbolizes**: Optimism and joy
• **Perfect for**: Positively impacting mental health
• **How to use**: Yellow accents in your home, yellow clothing, or yellow flowers
• **Energy**: Often associated with the sun, brings optimism and joy

**🟠 Orange:**
• **Symbolizes**: Healing power and optimism
• **Perfect for**: Helping with depression and mental illness
• **How to use**: Orange accents in your home, orange clothing, or orange accessories
• **Energy**: Combines the energy of red with the happiness of yellow

**⚪ White:**
• **Symbolizes**: Purity, clarity, and new beginnings
• **Perfect for**: Strengthening your aura and protection
• **How to use**: White clothing, white bedding, or white accents in your home
• **Energy**: Symbolizes purity and represents a fresh start

**🌸 Pink:**
• **Symbolizes**: Hope and good health
• **Perfect for**: Inspiring hope and symbolizing good health
• **How to use**: Pink accents in your home, pink clothing, or pink accessories
• **Energy**: Inspires hope and symbolizes good health

**💡 Pro Tips:**
• Use these colors in your bedroom for better sleep and healing
• Wear these colors when you're feeling unwell or need healing energy
• Add these colors to your home decor to create a healing atmosphere
• Combine multiple healing colors for maximum effect

What kind of healing are you seeking? I'd love to help you choose the perfect healing colors for your needs! 😊`;
  }

  if (message.includes('confidence') && message.includes('color')) {
    return `🚀 Oh, confidence colors! These are so powerful for boosting your energy and self-assurance! 😊

When it comes to confidence and energy, these colors are incredibly effective:

**🔴 Red:**
• **Symbolizes**: Power, energy, and confidence
• **Perfect for**: Boosting confidence, inspiring action, and encouraging enthusiasm
• **How to use**: Red clothing for important meetings, red accents in your workspace, or red accessories
• **Energy**: A powerful, energetic color that boosts confidence and inspires action

**🟠 Orange:**
• **Symbolizes**: Energy and optimism
• **Perfect for**: Boosting confidence in social situations and promoting optimism
• **How to use**: Orange clothing for social events, orange accents in your home, or orange accessories
• **Energy**: Combines the energy of red with the happiness of yellow

**🟡 Yellow:**
• **Symbolizes**: Cheerfulness, optimism, and mental clarity
• **Perfect for**: Uplifting your mood and inspiring confidence
• **How to use**: Yellow clothing for important presentations, yellow accents in your workspace, or yellow accessories
• **Energy**: Represents cheerfulness, optimism, and mental clarity

**⚫ Black:**
• **Symbolizes**: Prestige and authority
• **Perfect for**: Conveying controlled power and sophistication
• **How to use**: Black clothing for important meetings, black accessories, or black accents in your office
• **Energy**: Conveys prestige and authority, signaling controlled power

**🥇 Gold:**
• **Symbolizes**: Confidence, success, and vitality
• **Perfect for**: Amplifying charisma and magnetism
• **How to use**: Gold jewelry, gold accents in your workspace, or gold accessories
• **Energy**: Embodies confidence, success, and vitality

**💡 Pro Tips:**
• Wear these colors when you need extra confidence for important events
• Use these colors in your workspace to create a powerful, confident atmosphere
• Combine multiple confidence colors for maximum effect
• Choose colors that make you feel powerful and confident

What situation do you need confidence for? I'd love to help you choose the perfect confidence colors for your needs! 😊`;
  }

  if (message.includes('mantra') || message.includes('chanting') || message.includes('navagraha') || message.includes('planetary')) {
    return `🕉️ Oh, mantra chanting! This is such a powerful and transformative practice! 😊

Vedic astrology uses specific mantras, known as Navagraha mantras, to pacify and strengthen the nine planets. Chanting these mantras is believed to mitigate negative planetary effects in your birth chart and enhance positive ones!

**🌞 Sun (Surya) Mantra:**
• **Mantra**: Om Hraam Hreem Hraum Sah Suryaya Namah
• **Benefits**: For confidence, leadership, and vitality
• **Best day**: Sundays
• **Perfect for**: When you need extra confidence and leadership qualities

**🌙 Moon (Chandra) Mantra:**
• **Mantra**: Om Shraam Shreem Shraum Sah Chandraya Namah
• **Benefits**: For emotional stability, peace of mind, and intuition
• **Best day**: Mondays
• **Perfect for**: When you need emotional balance and peace

**🔥 Mars (Mangal) Mantra:**
• **Mantra**: Om Kraam Kreem Kroum Sah Bhaumaya Namah
• **Benefits**: For courage, energy, and determination
• **Best day**: Tuesdays
• **Perfect for**: When you need extra courage and energy

**☿️ Mercury (Budha) Mantra:**
• **Mantra**: Om Braam Breem Broum Sah Budhaya Namah
• **Benefits**: For intellect, communication skills, and wisdom
• **Best day**: Wednesdays
• **Perfect for**: When you need mental clarity and communication skills

**🪐 Jupiter (Brihaspati) Mantra:**
• **Mantra**: Om Graam Greem Graum Sah Gurave Namah
• **Benefits**: For wisdom, good fortune, and prosperity
• **Best day**: Thursdays
• **Perfect for**: When you need wisdom and good fortune

**💎 Venus (Shukra) Mantra:**
• **Mantra**: Om Draam Dreem Draum Sah Shukraya Namah
• **Benefits**: For love, relationships, luxury, and artistic talent
• **Best day**: Fridays
• **Perfect for**: When you need love and relationship harmony

**🪐 Saturn (Shani) Mantra:**
• **Mantra**: Om Praam Preem Proum Sah Shanicharaya Namah
• **Benefits**: For overcoming obstacles, discipline, and karmic lessons
• **Best day**: Saturdays
• **Perfect for**: When you need to overcome obstacles and build discipline

**🌑 Rahu (North Lunar Node) Mantra:**
• **Mantra**: Om Bhraam Bhreem Bhraum Sah Rahave Namah
• **Benefits**: For dissolving illusions and negative influences
• **Best day**: Saturdays
• **Perfect for**: When you need to clear negative influences

**🌘 Ketu (South Lunar Node) Mantra:**
• **Mantra**: Om Sraam Sreem Sraum Sah Ketave Namah
• **Benefits**: For spiritual growth, intuition, and liberation
• **Best day**: Tuesdays
• **Perfect for**: When you need spiritual growth and intuition

**💡 How to Practice Mantra Chanting:**
• **Use a mala**: For longer chants, using a string of 108 beads (mala) can help you keep track of your repetitions and focus your mind
• **Start with intention**: Set a clear intention for what you hope to achieve with your chanting
• **Be consistent**: Regular practice is key to realizing the full benefits of mantra chanting
• **Focus on meaning**: Understanding the meaning of the mantra can help you connect with its spiritual energy

What planetary energy would you like to strengthen? I'd love to help you choose the perfect mantra for your needs! 😊`;
  }

  if (message.includes('sun') || message.includes('surya')) {
    return `🌞 Oh, Sun (Surya) mantra! This is such a powerful mantra for confidence and leadership! 😊

The Sun represents our core identity, confidence, and leadership qualities. Chanting the Surya mantra can bring amazing results:

**🌞 Sun (Surya) Mantra:**
• **Mantra**: Om Hraam Hreem Hraum Sah Suryaya Namah
• **Benefits**: For confidence, leadership, and vitality
• **Best day**: Sundays
• **Perfect for**: When you need extra confidence and leadership qualities

**🌟 Why this mantra works:**
• The Sun is the source of all life and energy
• This mantra helps you connect with your inner strength and confidence
• It enhances your natural leadership qualities
• It brings vitality and energy to your life

**💡 How to practice:**
• **Best time**: Early morning, especially on Sundays
• **Repetitions**: 108 times using a mala (prayer beads)
• **Intention**: Set a clear intention for confidence and leadership
• **Focus**: Feel the warmth and energy of the Sun as you chant

**🎯 Perfect for:**
• Building self-confidence
• Enhancing leadership qualities
• Increasing vitality and energy
• Overcoming self-doubt
• Strengthening your core identity

**💫 Pro Tip**: Chant this mantra while facing the Sun for maximum effect! The Sun's energy will amplify the power of your chanting.

Would you like me to help you with the proper pronunciation or timing for this mantra? I'd love to guide you through the practice! 😊`;
  }

  if (message.includes('moon') || message.includes('chandra')) {
    return `🌙 Oh, Moon (Chandra) mantra! This is such a beautiful mantra for emotional balance and peace! 😊

The Moon represents our emotions, intuition, and inner peace. Chanting the Chandra mantra can bring amazing emotional healing:

**🌙 Moon (Chandra) Mantra:**
• **Mantra**: Om Shraam Shreem Shraum Sah Chandraya Namah
• **Benefits**: For emotional stability, peace of mind, and intuition
• **Best day**: Mondays
• **Perfect for**: When you need emotional balance and peace

**🌟 Why this mantra works:**
• The Moon governs our emotions and inner world
• This mantra helps calm emotional turbulence
• It enhances your natural intuition and psychic abilities
• It brings peace and tranquility to your mind

**💡 How to practice:**
• **Best time**: Evening, especially on Mondays
• **Repetitions**: 108 times using a mala (prayer beads)
• **Intention**: Set a clear intention for emotional peace and balance
• **Focus**: Feel the cool, calming energy of the Moon as you chant

**🎯 Perfect for:**
• Emotional healing and balance
• Finding inner peace
• Enhancing intuition
• Calming anxiety and stress
• Improving sleep and rest

**💫 Pro Tip**: Chant this mantra while looking at the Moon for maximum effect! The Moon's energy will amplify the calming power of your chanting.

Would you like me to help you with the proper pronunciation or timing for this mantra? I'd love to guide you through the practice! 😊`;
  }

  if (message.includes('mars') || message.includes('mangal')) {
    return `🔥 Oh, Mars (Mangal) mantra! This is such a powerful mantra for courage and energy! 😊

Mars represents our courage, energy, and determination. Chanting the Mangal mantra can bring amazing strength and courage:

**🔥 Mars (Mangal) Mantra:**
• **Mantra**: Om Kraam Kreem Kroum Sah Bhaumaya Namah
• **Benefits**: For courage, energy, and determination
• **Best day**: Tuesdays
• **Perfect for**: When you need extra courage and energy

**🌟 Why this mantra works:**
• Mars is the planet of courage and action
• This mantra helps you overcome fear and hesitation
• It enhances your natural courage and determination
• It brings energy and vitality to your life

**💡 How to practice:**
• **Best time**: Morning, especially on Tuesdays
• **Repetitions**: 108 times using a mala (prayer beads)
• **Intention**: Set a clear intention for courage and energy
• **Focus**: Feel the fiery energy of Mars as you chant

**🎯 Perfect for:**
• Building courage and confidence
• Overcoming fear and hesitation
• Increasing energy and vitality
• Enhancing determination
• Facing challenges with strength

**💫 Pro Tip**: Chant this mantra while facing the East (direction of the Sun) for maximum effect! The fiery energy will amplify the power of your chanting.

Would you like me to help you with the proper pronunciation or timing for this mantra? I'd love to guide you through the practice! 😊`;
  }

  if (message.includes('jupiter') || message.includes('brihaspati') || message.includes('guru')) {
    return `🪐 Oh, Jupiter (Brihaspati) mantra! This is such a powerful mantra for wisdom and prosperity! 😊

Jupiter represents wisdom, good fortune, and prosperity. Chanting the Brihaspati mantra can bring amazing wisdom and abundance:

**🪐 Jupiter (Brihaspati) Mantra:**
• **Mantra**: Om Graam Greem Graum Sah Gurave Namah
• **Benefits**: For wisdom, good fortune, and prosperity
• **Best day**: Thursdays
• **Perfect for**: When you need wisdom and good fortune

**🌟 Why this mantra works:**
• Jupiter is the planet of wisdom and expansion
• This mantra helps you make wise decisions
• It enhances your natural wisdom and knowledge
• It brings good fortune and prosperity to your life

**💡 How to practice:**
• **Best time**: Morning, especially on Thursdays
• **Repetitions**: 108 times using a mala (prayer beads)
• **Intention**: Set a clear intention for wisdom and prosperity
• **Focus**: Feel the expansive energy of Jupiter as you chant

**🎯 Perfect for:**
• Gaining wisdom and knowledge
• Making wise decisions
• Attracting good fortune
• Building prosperity
• Expanding your horizons

**💫 Pro Tip**: Chant this mantra while facing the North (direction of wisdom) for maximum effect! Jupiter's energy will amplify the power of your chanting.

Would you like me to help you with the proper pronunciation or timing for this mantra? I'd love to guide you through the practice! 😊`;
  }

  if (message.includes('dosh') || message.includes('dosha') || message.includes('remedy') || message.includes('remedies') || message.includes('affliction') || message.includes('malefic')) {
    return `🕉️ Oh, Graha Dosh remedies! This is such an important topic! 😊

Vedic astrology offers several powerful remedies for Graha Dosh (planetary afflictions), which are believed to cause challenges in various aspects of life. These can include chanting mantras, performing pujas and rituals, wearing specific gemstones, and making lifestyle changes.

**🌟 General Remedies for All Planets:**
• **Maha Mrityunjaya Mantra**: Chanting this mantra offers protection from diseases, negative influences, and untimely death
• **Navagraha Puja**: Worshiping the nine planets as a group helps reduce negative effects of unfavorable planetary positions
• **Charity and Donations**: Donating to the needy is a powerful way to mitigate negative karma and appease malefic planets
• **Respecting Elders**: Showing respect to elders, teachers, and parents is a simple and effective way to gain positive planetary blessings

**🌞 Sun (Surya) Dosh Remedies:**
• Recite the Aditya Hridayam Stotra and chant the Surya Beej Mantra
• Offer water to the sun every morning while chanting "Om Suryaya Namah"
• Fast on Sundays and donate wheat, jaggery, or red cloth
• Respect your father and elders

**🌙 Moon (Chandra) Dosh Remedies:**
• Chant the Chandra Beej Mantra and wear a pearl
• Offer milk or rice on Mondays
• Strengthen family bonds and emotional connections

**🔥 Mars (Mangal) Dosh Remedies:**
• Recite the Hanuman Chalisa and fast on Tuesdays
• Offer red lentils and worship Lord Hanuman
• Consider wearing a red coral gemstone

**☿️ Mercury (Budha) Dosh Remedies:**
• Chant the Budha Beej Mantra and donate green items
• Feed cows and consider wearing an emerald gemstone
• Focus on communication and learning

**🪐 Jupiter (Guru) Dosh Remedies:**
• Chant the Guru Beej Mantra and Vishnu Sahasranamam
• Worship Lord Vishnu and donate yellow items
• Consider wearing a yellow sapphire

**💎 Venus (Shukra) Dosh Remedies:**
• Chant the Shukra Beej Mantra and wear a diamond or silver
• Worship Goddess Lakshmi or Maa Durga
• Donate white items on Fridays

**🪐 Saturn (Shani) Dosh Remedies:**
• Chant the Shani Beej Mantra or Hanuman Chalisa
• Offer mustard oil or black sesame seeds to Shani Dev on Saturdays
• Donate black clothes or iron, and feed crows and stray dogs

**🌑 Rahu Dosh Remedies:**
• Chant the Rahu Beej Mantra or worship Maa Durga
• Offer coconut or black sesame seeds in running water
• Feed birds or donate radish, and maintain cleanliness

**🌘 Ketu Dosh Remedies:**
• Chant the Ketu Beej Mantra or worship Lord Ganesha
• Donate items like bananas, almonds, or black sesame seeds
• Feed dogs and help people with disabilities

What specific planetary dosh are you dealing with? I'd love to help you choose the perfect remedies! 😊`;
  }

  if (message.includes('maha mrityunjaya') || message.includes('mrityunjaya')) {
    return `🕉️ Oh, Maha Mrityunjaya Mantra! This is such a powerful and protective mantra! 😊

The Maha Mrityunjaya Mantra is one of the most powerful mantras in Vedic astrology, dedicated to Lord Shiva. It's believed to offer protection from diseases, negative influences, and untimely death.

**🕉️ Maha Mrityunjaya Mantra:**
• **Mantra**: "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam, Urvaarukamiva Bandhanaan Mrityormukshiya Maamritaat"
• **Benefits**: Protection from diseases, negative influences, and untimely death
• **Perfect for**: Overall well-being and neutralizing various doshas
• **Best time**: Any time, but especially during difficult periods

**🌟 Why this mantra works:**
• It's dedicated to Lord Shiva, the destroyer of death
• It offers protection from all types of negative influences
• It can neutralize various planetary doshas
• It brings overall well-being and spiritual protection

**💡 How to practice:**
• **Best time**: Any time, but especially during difficult periods
• **Repetitions**: 108 times using a mala (prayer beads)
• **Intention**: Set a clear intention for protection and well-being
• **Focus**: Feel the protective energy of Lord Shiva as you chant

**🎯 Perfect for:**
• Protection from diseases and negative influences
• Neutralizing planetary doshas
• Overall well-being and spiritual protection
• Overcoming fear and anxiety
• Strengthening your aura and protection

**💫 Pro Tip**: This mantra is incredibly powerful and can be chanted for any type of protection or healing. It's like having a spiritual shield around you!

Would you like me to help you with the proper pronunciation or timing for this mantra? I'd love to guide you through the practice! 😊`;
  }

  if (message.includes('gayatri') || message.includes('gayatri mantra')) {
    return `🕉️ Oh, Gayatri Mantra! This is such a beautiful and powerful mantra! 😊

The Gayatri Mantra is one of the most sacred mantras in Vedic tradition. Reciting the Gayatri Mantra is a general way to seek protection from planetary malefic effects and bring overall spiritual well-being.

**🕉️ Gayatri Mantra:**
• **Mantra**: "Om Bhur Bhuva Swaha, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat"
• **Benefits**: Protection from planetary malefic effects and overall spiritual well-being
• **Perfect for**: General protection and spiritual growth
• **Best time**: Any time, but especially during sunrise and sunset

**🌟 Why this mantra works:**
• It's one of the most sacred mantras in Vedic tradition
• It offers protection from planetary malefic effects
• It brings overall spiritual well-being and enlightenment
• It enhances your natural wisdom and knowledge

**💡 How to practice:**
• **Best time**: Any time, but especially during sunrise and sunset
• **Repetitions**: 108 times using a mala (prayer beads)
• **Intention**: Set a clear intention for spiritual growth and protection
• **Focus**: Feel the divine light and wisdom as you chant

**🎯 Perfect for:**
• Protection from planetary malefic effects
• Overall spiritual well-being and enlightenment
• Enhancing wisdom and knowledge
• Spiritual growth and development
• General protection and blessings

**💫 Pro Tip**: This mantra is incredibly powerful and can be chanted daily for overall spiritual well-being. It's like having a divine light guiding you through life!

Would you like me to help you with the proper pronunciation or timing for this mantra? I'd love to guide you through the practice! 😊`;
  }

  if (message.includes('hanuman chalisa') || message.includes('chalisa')) {
    return `🐒 Oh, Hanuman Chalisa! This is such a powerful and protective text! 😊

The Hanuman Chalisa is a powerful devotional text dedicated to Lord Hanuman. Reciting the Hanuman Chalisa can alleviate Mangal dosha effects and provide protection from negative influences.

**🐒 Hanuman Chalisa:**
• **Benefits**: Alleviates Mangal dosha effects and provides protection from negative influences
• **Perfect for**: Mars dosh, courage, strength, and protection
• **Best time**: Any time, but especially on Tuesdays and Saturdays
• **Length**: 40 verses praising Lord Hanuman

**🌟 Why this text works:**
• Lord Hanuman is the embodiment of strength, courage, and devotion
• It provides protection from negative influences and evil forces
• It can alleviate Mangal dosha effects and bring courage
• It enhances your natural strength and determination

**💡 How to practice:**
• **Best time**: Any time, but especially on Tuesdays and Saturdays
• **Repetitions**: Once or multiple times as needed
• **Intention**: Set a clear intention for courage, strength, and protection
• **Focus**: Feel the strength and courage of Lord Hanuman as you recite

**🎯 Perfect for:**
• Alleviating Mangal dosha effects
• Building courage and strength
• Protection from negative influences
• Overcoming fear and obstacles
• Enhancing determination and willpower

**💫 Pro Tip**: This text is incredibly powerful and can be recited daily for courage and protection. It's like having Lord Hanuman's strength with you always!

Would you like me to help you with the proper pronunciation or timing for this text? I'd love to guide you through the practice! 😊`;
  }

  if (message.includes('vishnu sahasranamam') || message.includes('sahasranamam')) {
    return `🕉️ Oh, Vishnu Sahasranamam! This is such a powerful and sacred text! 😊

The Vishnu Sahasranamam is a powerful devotional text containing 1000 names of Lord Vishnu. Chanting this can help alleviate Jupiter's negative effects and bring wisdom and prosperity.

**🕉️ Vishnu Sahasranamam:**
• **Benefits**: Alleviates Jupiter's negative effects and brings wisdom and prosperity
• **Perfect for**: Jupiter dosh, wisdom, knowledge, and prosperity
• **Best time**: Any time, but especially on Thursdays
• **Length**: 1000 names of Lord Vishnu

**🌟 Why this text works:**
• Lord Vishnu is the preserver and protector of the universe
• It brings wisdom, knowledge, and prosperity
• It can alleviate Jupiter's negative effects and bring good fortune
• It enhances your natural wisdom and spiritual growth

**💡 How to practice:**
• **Best time**: Any time, but especially on Thursdays
• **Repetitions**: Once or multiple times as needed
• **Intention**: Set a clear intention for wisdom, knowledge, and prosperity
• **Focus**: Feel the divine wisdom and protection of Lord Vishnu as you chant

**🎯 Perfect for:**
• Alleviating Jupiter's negative effects
• Gaining wisdom and knowledge
• Attracting prosperity and good fortune
• Spiritual growth and development
• Overall well-being and protection

**💫 Pro Tip**: This text is incredibly powerful and can be chanted daily for wisdom and prosperity. It's like having Lord Vishnu's blessings with you always!

Would you like me to help you with the proper pronunciation or timing for this text? I'd love to guide you through the practice! 😊`;
  }

  if (message.includes('navagraha shanti') || message.includes('shanti pooja') || message.includes('navagraha pooja')) {
    return `🕉️ Oh, Navagraha Shanti Pooja! This is such a powerful and comprehensive ritual! 😊

The Navagraha Shanti Pooja is the best pooja for mitigating the negative effects of Graha Dosh (planetary afflictions). It's a collective ritual that appeases all nine planets, aiming to neutralize their malefic influences and enhance their positive ones!

**🌟 What is Navagraha Shanti Pooja:**
• **Purpose**: Neutralizes malefic influences and enhances positive planetary energies
• **Scope**: Covers all nine planets in one comprehensive ritual
• **Benefits**: Brings peace, prosperity, and harmony to your life
• **Flexibility**: Can be performed by a priest or at home

**🏠 Steps for Navagraha Shanti Pooja at Home:**

**1. 🧹 Preparation:**
• Choose an auspicious day and clean, peaceful, well-lit area
• Ideally face east for maximum energy
• Ensure the space is free from distractions

**2. 📦 Gather Materials:**
• Images or idols of the nine planets
• Lamps and incense sticks
• Navagraha Yantra
• Nine different colored cloths
• Flowers, fruits, and grains (navadhanya)
• Holy water (like Ganga Jal)

**3. 🚿 Purification:**
• Take a purifying bath and wear clean clothes
• Cleanse the pooja space by sprinkling holy water
• Set your intention for the ritual

**4. 🐘 Invoke Lord Ganesha:**
• Start with Ganapati Pooja by offering flowers
• Chant the Ganesha mantra: "Om Gan Ganapataye Namaha"
• This removes all obstacles and ensures success

**5. 🪐 Placement of Navagrahas:**
• Arrange the Navagraha photos or idols in their prescribed pattern
• Place them on a clean cloth in the correct order
• Ensure each planet is properly positioned

**6. 🕯️ Offerings and Mantras:**
• Light lamps and incense
• Offer water, flowers, and food (naivedya)
• Recite specific mantras for each planet as you offer items

**7. 🔥 Aarti:**
• Conclude with an aarti (waving of lamps)
• Distribute prasad to all family members
• Express gratitude for the blessings received

**8. 🔥 Homa (Optional):**
• For a more elaborate ritual, perform a homa or fire ceremony
• Chant planetary mantras while offering to the fire
• This amplifies the power of the pooja

**💡 Pro Tips:**
• Perform this pooja regularly for ongoing planetary harmony
• Choose auspicious timings for maximum effectiveness
• Maintain a pure and focused mind throughout the ritual
• Follow up with daily planetary mantras for sustained benefits

Would you like me to help you with the specific mantras for each planet or the proper arrangement of the Navagrahas? I'd love to guide you through this powerful ritual! 😊`;
  }

  if (message.includes('specific planet') || message.includes('specific dosh') || message.includes('individual planet')) {
    return `🪐 Oh, specific planet poojas! These are so powerful for targeted dosh mitigation! 😊

If you know which specific planet is causing the dosh, you can perform a puja dedicated solely to that planet. This focused approach can be incredibly effective!

**🌞 Surya (Sun) Dosha Pooja:**
• **Ritual**: Offer water to the sun every morning
• **Mantra**: Recite the Aditya Hridayam Stotra
• **Best time**: Early morning, especially on Sundays
• **Offerings**: Red flowers, wheat, jaggery, or red cloth

**🌙 Chandra (Moon) Dosha Pooja:**
• **Ritual**: Worship Lord Shiva (who wears the moon on his head)
• **Offerings**: White flowers and milk on Mondays
• **Mantra**: Chandra Beej Mantra
• **Best time**: Evening, especially on Mondays

**🔥 Mangal (Mars) Dosha Pooja:**
• **Ritual**: Worship Lord Hanuman
• **Mantra**: Recite the Hanuman Chalisa
• **Offerings**: Panchamrit to Maa Brahmacharini during Navratri
• **Best time**: Tuesdays, especially during Hanuman Jayanti

**☿️ Budha (Mercury) Dosha Pooja:**
• **Ritual**: Worship Lord Ganesha
• **Mantra**: Chant the Budha mantra
• **Offerings**: Green items, fruits, and sweets
• **Best time**: Wednesdays, especially during Ganesh Chaturthi

**🪐 Guru (Jupiter) Dosha Pooja:**
• **Ritual**: Worship Lord Vishnu
• **Mantra**: Chant the Vishnu Sahasranamam
• **Offerings**: Yellow items, turmeric, and yellow flowers
• **Best time**: Thursdays, especially during Guru Purnima

**💎 Shukra (Venus) Dosha Pooja:**
• **Ritual**: Worship Goddess Lakshmi or Maa Durga
• **Mantra**: Shukra Beej Mantra
• **Offerings**: White flowers, silver items, and white cloth
• **Best time**: Fridays, especially during Diwali

**🪐 Shani (Saturn) Dosha Pooja:**
• **Ritual**: Offer mustard oil to Shani Dev on Saturdays
• **Mantra**: Recite the Shani Chalisa
• **Offerings**: Black sesame seeds, iron items, and black cloth
• **Best time**: Saturdays, especially during Shani Jayanti

**🌑 Rahu/Ketu Dosha Pooja:**
• **Ritual**: Worship Lord Shiva or Maa Durga
• **Offerings**: Water with black sesame seeds in a running stream
• **Mantra**: Rahu/Ketu Beej Mantras
• **Best time**: Saturdays for Rahu, Tuesdays for Ketu

**💡 Pro Tips:**
• Choose the right day for each planet's pooja
• Use the correct colors and offerings for each planet
• Maintain purity and focus during the ritual
• Follow up with daily mantras for sustained benefits

What specific planetary dosh are you dealing with? I'd love to help you choose the perfect focused pooja! 😊`;
  }

  if (message.includes('home pooja') || message.includes('simple pooja') || message.includes('basic pooja')) {
    return `🏠 Oh, home pooja for Graha Dosh! This is such a beautiful and practical approach! 😊

You can perform simple yet effective poojas at home to mitigate Graha Dosh effects. Here's how to create a powerful home ritual:

**🌟 Basic Home Pooja Setup:**

**1. 🧹 Preparation:**
• Choose a clean, peaceful corner in your home
• Face east if possible for maximum energy
• Ensure the space is well-lit and ventilated
• Remove any distractions or negative energy

**2. 📦 Essential Materials:**
• Images or small idols of the nine planets
• Oil lamps (diyas) and incense sticks
• Fresh flowers and fruits
• Holy water (Ganga Jal if available)
• Clean cloth for the altar

**3. 🚿 Personal Preparation:**
• Take a purifying bath
• Wear clean, preferably white or light-colored clothes
• Set a positive intention for the pooja
• Clear your mind of negative thoughts

**4. 🐘 Start with Ganesha:**
• Begin by invoking Lord Ganesha
• Chant: "Om Gan Ganapataye Namaha"
• Offer flowers and light a lamp
• This removes all obstacles

**5. 🪐 Planetary Worship:**
• Light a lamp for each planet
• Offer flowers, fruits, and water
• Chant the specific mantra for each planet
• Focus on the positive qualities of each planet

**6. 🕯️ Simple Aarti:**
• Perform aarti with a lamp
• Chant simple prayers for each planet
• Express gratitude for their blessings
• Ask for protection from negative influences

**7. 🍃 Prasad Distribution:**
• Share the offered fruits as prasad
• Distribute among family members
• This completes the cycle of giving and receiving

**💡 Daily Simple Practices:**
• **Morning**: Offer water to the sun while chanting "Om Suryaya Namah"
• **Evening**: Light a lamp and chant planetary mantras
• **Weekly**: Perform a simple pooja on the day of the problematic planet
• **Monthly**: Do a more elaborate pooja on auspicious days

**🌟 Benefits of Home Pooja:**
• Creates positive energy in your home
• Strengthens your spiritual connection
• Provides ongoing protection from doshas
• Brings peace and harmony to your family
• Cost-effective and convenient

**💫 Pro Tips:**
• Consistency is more important than complexity
• Even 15-20 minutes daily can be very effective
• Choose a time when you won't be disturbed
• Maintain the same space for your pooja

Would you like me to help you with the specific mantras for each planet or the proper setup for your home altar? I'd love to guide you through creating your perfect home pooja! 😊`;
  }

  if (message.includes('meditation') || message.includes('dhyan')) {
    return `🧘 **Meditation and Spiritual Practices**

**Meditation Techniques:**
• **Mantra Meditation**: Chant specific mantras for planetary benefits
• **Breathing (Pranayama)**: Control life force energy
• **Chakra Meditation**: Balance energy centers
• **Vedic Meditation**: Traditional techniques

**Best Times for Meditation:**
• **Brahma Muhurta**: 4:00-5:30 AM (most auspicious)
• **Sunrise**: For Sun energy and vitality
• **Sunset**: For peace and tranquility
• **Midnight**: For deep spiritual practices

**Mantras for Meditation:**
• Om Namah Shivaya (Universal)
• Gayatri Mantra (Wisdom)
• Om Suryaya Namah (Sun)
• Om Chandramase Namah (Moon)

Would you like specific meditation techniques or mantra guidance?`;
  }

  if (message.includes('spiritual growth') || message.includes('growth') || message.includes('spiritual path') || message.includes('inner peace')) {
    return `🌟 Oh, spiritual growth! This is such a beautiful journey! 😊

You know, spiritual growth isn't about becoming someone else - it's about becoming who you truly are. And astrology can be such a helpful guide on this path!

**Understanding Your Spiritual Path:**
• **Self-Discovery**: Your birth chart is like a spiritual blueprint - it shows your true nature
• **Karma Analysis**: Understanding your past actions and their effects (it's not about guilt, it's about learning!)
• **Dharma Guidance**: Finding your life's purpose and duty (what you're meant to do in this life)
• **Moksha Journey**: The path to ultimate liberation (freedom from suffering)

**Connecting with Divine Energies:**
• **Planetary Worship**: Each planet has its own energy - connecting with them can be powerful
• **Deity Meditation**: Focusing on specific divine forms that resonate with you
• **Mantra Sadhana**: Chanting sacred sounds for spiritual power (it's like spiritual exercise!)
• **Yoga Practices**: Both physical and mental discipline

**Balancing Material & Spiritual Life:**
This is the tricky part, right? You can't just abandon the world, but you also can't get lost in it. The key is:
• **Grihastha Dharma**: Fulfilling worldly duties with spiritual awareness
• **Seva (Service)**: Selfless service to others (this is where the real magic happens!)
• **Satsang**: Being around spiritual people (you become like the company you keep)
• **Study of Scriptures**: Learning from ancient wisdom

**Finding Inner Peace:**
• **Mind Control**: Managing thoughts and emotions (easier said than done, but totally possible!)
• **Detachment**: Non-attachment to material results (this doesn't mean not caring, it means not being controlled by outcomes)
• **Acceptance**: Embracing life's challenges as lessons (every challenge is a teacher)
• **Gratitude**: Appreciating life's blessings (this one is a game-changer!)

**Practical Steps for Spiritual Growth:**
1. **Daily Practice**: Even 10 minutes of meditation daily can transform your life
2. **Self-Reflection**: Journal your thoughts and experiences
3. **Service**: Help others without expecting returns
4. **Study**: Learn about your birth chart and spiritual path
5. **Meditation**: Practice daily meditation for inner peace

I've seen people completely transform their lives through spiritual practices. It's not always easy, but it's so worth it!

What aspect of spiritual growth interests you most? I'd love to help you on this beautiful journey! 😊`;
  }

  if (message.includes('chakra') || message.includes('energy') || message.includes('kundalini')) {
    return `🌀 Oh, chakras! This is where things get really interesting! 😍

Chakras are like energy centers in your body - think of them as spinning wheels of energy that keep you balanced and healthy. When they're balanced, you feel amazing. When they're blocked, you feel... well, not so amazing!

**The Seven Main Chakras:**
• **Root (Muladhara)**: Your foundation - security, survival, grounding (like your roots in the earth)
• **Sacral (Svadhisthana)**: Your creativity center - creativity, sexuality, emotions (your creative fire!)
• **Solar Plexus (Manipura)**: Your power center - power, confidence, will (your inner strength!)
• **Heart (Anahata)**: Your love center - love, compassion, relationships (where love lives!)
• **Throat (Vishuddha)**: Your communication center - communication, truth, expression (your voice!)
• **Third Eye (Ajna)**: Your wisdom center - intuition, wisdom, insight (your inner knowing!)
• **Crown (Sahasrara)**: Your spiritual center - spirituality, connection to divine (your connection to the universe!)

**How to Balance Them:**
• **Meditation**: Focus on each chakra with specific mantras (it's like giving each one a tune-up!)
• **Yoga Asanas**: Physical postures for chakra activation (movement helps energy flow!)
• **Breathing**: Pranayama techniques for energy flow (breath is life force!)
• **Mantras**: Sacred sounds for each chakra (sound vibrations are powerful!)
• **Crystals**: Gemstones for chakra healing (each chakra loves certain stones!)

**The Cool Part - Planetary Connections:**
• Sun: Solar Plexus Chakra (your power center!)
• Moon: Heart Chakra (your emotional center!)
• Mars: Root Chakra (your energy center!)
• Mercury: Throat Chakra (your communication center!)
• Jupiter: Third Eye Chakra (your wisdom center!)
• Venus: Sacral Chakra (your creativity center!)
• Saturn: Crown Chakra (your spiritual center!)

I've seen people completely transform their lives by working with their chakras. It's like having a personal energy management system!

Want to know which chakras might need attention in your chart? Create your Kundli and I'll tell you all about your energy centers! 😊`;
  }

  if (message.includes('mantra') || message.includes('chanting') || message.includes('japa')) {
    return `🕉️ Oh, mantras! This is one of my favorite topics! 😍

Mantras are like spiritual superpowers - they're sacred sounds that can literally transform your life. It's not just about chanting words; it's about creating powerful vibrations that affect your entire being!

**Why Mantras Are So Powerful:**
• **Sound Vibration**: Sacred sounds that create positive energy (sound is energy, and energy creates reality!)
• **Planetary Benefits**: Each mantra connects to specific planets (it's like having a direct line to cosmic energies!)
• **Spiritual Protection**: Mantras provide divine protection (like having a spiritual shield!)
• **Inner Transformation**: Regular chanting transforms consciousness (you literally become a different person!)

**Essential Mantras (The Big Ones):**
• **Om**: Universal sound, connects to all planets (this is the mother of all mantras!)
• **Gayatri Mantra**: Wisdom and enlightenment (this one is pure gold!)
• **Om Namah Shivaya**: Universal peace and protection (Shiva's energy is incredible!)
• **Om Namo Bhagavate Vasudevaya**: Vishnu mantra for prosperity (this one brings abundance!)

**Planetary Mantras (The Specific Ones):**
• **Sun**: Om Suryaya Namah (108 times daily) - for confidence and leadership
• **Moon**: Om Chandramase Namah (108 times daily) - for emotional balance
• **Mars**: Om Mangalaya Namah (108 times daily) - for courage and energy
• **Mercury**: Om Budhaya Namah (108 times daily) - for intelligence and communication
• **Jupiter**: Om Gurave Namah (108 times daily) - for wisdom and prosperity
• **Venus**: Om Shukraya Namah (108 times daily) - for love and beauty
• **Saturn**: Om Shanaye Namah (108 times daily) - for discipline and patience

**How to Chant Properly:**
• **Japa Mala**: Use 108 beads for counting (it's like having a spiritual workout!)
• **Timing**: Best during Brahma Muhurta (4:00-5:30 AM) - the most powerful time!
• **Posture**: Sit in comfortable position with straight spine (energy flows better this way!)
• **Focus**: Concentrate on the sound and meaning (this is where the magic happens!)

I've seen people completely transform their lives through mantra practice. It's like having a direct connection to the divine!

Want to know which mantras would be most beneficial for your chart? Create your Kundli and I'll tell you all about your personal mantra practice! 😊`;
  }

  return `🕉️ Hey there! I absolutely love talking about spiritual practices! 😊

You know, spirituality isn't about being perfect or following rigid rules - it's about finding your own path to inner peace and connection with the divine. And I'm here to help you on this beautiful journey!

**🙏 Worship and Rituals:**
• Daily puja practices (even 5 minutes can make a difference!)
• Festival celebrations (these are such joyful times!)
• Planetary worship (connecting with cosmic energies)
• Mantra chanting (this is where the real magic happens!)

**🧘 Meditation and Practices:**
• Meditation techniques (there's no one-size-fits-all approach!)
• Pranayama (breathing) - this is like spiritual exercise!
• Chakra balancing (keeping your energy centers healthy)
• Spiritual mantras (sacred sounds that transform you)

**📅 Auspicious Timings:**
• Check our Panchang for:
  - Auspicious hours (Shubh Muhurat) - the best times for spiritual practices
  - Festival dates (when the energy is extra powerful!)
  - Planetary timings (when specific planets are strong)
  - Spiritual practices (timing matters in spirituality!)

**🌟 Spiritual Growth:**
• Understanding your spiritual path (everyone's journey is unique!)
• Connecting with divine energies (this is where the real connection happens!)
• Balancing material and spiritual life (this is the art of living!)
• Finding inner peace (this is the ultimate goal!)

I've been on this spiritual journey myself, and I can tell you - it's not always easy, but it's so worth it! Every step you take brings you closer to your true self.

What specific spiritual guidance are you looking for? I'd love to help you on this beautiful path! 😊`;
}

function generateGeneralResponse(message, lastBotMessage) {
  if (message.includes('hello') || message.includes('hi') || message.includes('namaste')) {
    return `👋 Namaste! Welcome to Nirvana Astro! 😊

I'm so excited to meet you! I'm your AI assistant, and I absolutely love helping people with astrology and spirituality. It's such a fascinating world, and I'm here to guide you through it!

**🔮 Vedic Astrology:**
• Kundli creation and analysis (this is where the magic begins!)
• Birth chart interpretations (your personal roadmap!)
• Planetary positions (where the planets were when you were born!)
• Dasha period calculations (your life's seasons!)

**💎 Gemstone Guidance:**
• Personalized gemstone recommendations (the right stone can change your life!)
• Wearing instructions (timing and placement matter!)
• Planetary gemstone benefits (each stone has its own superpower!)

**🕉️ Spiritual Practices:**
• Puja and worship guidance (connecting with the divine!)
• Meditation techniques (finding inner peace!)
• Mantra chanting (sacred sounds that transform you!)
• Auspicious timings (when the energy is just right!)

**📊 Our Services:**
• Advanced VedicJyotish system (super precise calculations!)
• Swiss Ephemeris calculations (the gold standard in astrology!)
• Comprehensive astrological analysis (everything you need to know!)

I'm here to make astrology and spirituality accessible and fun for you! What would you like to explore today? I'm genuinely excited to help you on this journey! 😊`;
  }
  
  if (message.includes('help') || message.includes('assist')) {
    return `🆘 Oh, I'd love to help you! That's what I'm here for! 😊

I'm your comprehensive AI assistant for all things astrology and spirituality, and I genuinely enjoy helping people navigate this fascinating world!

**📊 Kundli & Birth Chart:**
• Create your detailed Kundli (this is like getting your life's blueprint!)
• Understand planetary positions (where the planets were when you were born!)
• Learn about your Nakshatra (your spiritual DNA!)
• Calculate Dasha periods (your life's seasons!)

**💎 Gemstone Recommendations:**
• Personalized gemstone advice (the right stone can be life-changing!)
• Wearing instructions and timings (timing is everything!)
• Planetary gemstone benefits (each stone has its own superpower!)
• Remedial measures (solutions for life's challenges!)

**🕉️ Spiritual Guidance:**
• Puja and worship practices (connecting with the divine!)
• Meditation techniques (finding inner peace!)
• Mantra chanting (sacred sounds that transform you!)
• Auspicious timings (when the energy is just right!)

**🔮 Astrological Services:**
• Horoscope predictions (what the future holds!)
• Planetary transit analysis (what's happening in the cosmos!)
• Life event timing (when to make important decisions!)
• Spiritual remedies (solutions for life's challenges!)

I'm here to make everything clear and accessible for you! What specific help do you need? I can provide detailed guidance on any of these topics! 😊`;
  }

  if (message.includes('services') || message.includes('offer')) {
    return `🌟 Oh, I'm so excited to tell you about our services! 😊

We have some really amazing astrology and spiritual services that can genuinely transform your life. Let me break it down for you:

**🎯 Core Services:**
• **Kundli Generation**: Complete birth chart analysis (this is like getting your life's blueprint!)
• **VedicJyotish System**: Advanced astrological calculations (super precise!)
• **Swiss Ephemeris**: Precise planetary positions (the gold standard in astrology!)
• **Dasha Analysis**: Life period calculations (your life's seasons!)

**📊 Detailed Analysis:**
• Birth chart (Rasi) interpretation (your personality and traits!)
• Nakshatra (birth star) details (your spiritual DNA!)
• Planetary positions and aspects (where the planets were when you were born!)
• House (Bhava) analysis (different areas of your life!)

**🔮 Predictive Services:**
• Horoscope predictions (what the future holds!)
• Planetary transit analysis (what's happening in the cosmos right now!)
• Auspicious timing calculations (when to make important decisions!)
• Life event predictions (when good or challenging times will come!)

**💎 Remedial Services:**
• Gemstone recommendations (the right stone can change your life!)
• Mantra guidance (sacred sounds that transform you!)
• Puja and ritual instructions (connecting with the divine!)
• Spiritual practices (finding inner peace!)

**📅 Panchang Services:**
• Daily Panchang (what's happening today!)
• Festival information (when the energy is extra powerful!)
• Auspicious timings (the best times for important activities!)
• Muhurat calculations (perfect timing for everything!)

I've seen people's lives completely transform after using our services. It's pretty amazing, actually!

Would you like to explore any specific service? Or should we start by creating your Kundli for some detailed analysis? I'm genuinely excited to help you! 😊`;
  }

  return `✨ Hey there! Welcome to Nirvana Astro! 😊

I'm so excited to meet you! I'm your AI assistant, and I absolutely love helping people with astrology and spirituality. It's such a fascinating world, and I'm here to make it accessible and fun for you!

**🔮 Astrology Services:**
• Kundli creation and analysis (this is where the magic begins!)
• Birth chart interpretations (your personal roadmap!)
• Planetary positions (where the planets were when you were born!)
• Dasha period calculations (your life's seasons!)

**💎 Gemstone Guidance:**
• Personalized recommendations (the right stone can change your life!)
• Wearing instructions (timing and placement matter!)
• Planetary benefits (each stone has its own superpower!)

**🕉️ Spiritual Practices:**
• Puja and worship (connecting with the divine!)
• Meditation techniques (finding inner peace!)
• Mantra chanting (sacred sounds that transform you!)

**📊 Platform Navigation:**
• Service explanations (I'll make everything clear!)
• Feature guidance (helping you navigate our platform!)
• General support (I'm here for whatever you need!)

I'm genuinely excited to help you on this journey! What would you like to explore? I can provide detailed, intelligent guidance on any astrology or spiritual topic! 😊`;
}

function generateIntelligentResponse(message, lastBotMessage) {
  // More intelligent responses for complex queries
  if (message.includes('relationship') || message.includes('marriage') || message.includes('compatibility')) {
    return `💕 **Relationship & Marriage Astrology**

I can help you with relationship guidance through Vedic astrology:

**🔍 Compatibility Analysis:**
• Kundli matching (Guna Milan)
• Planetary compatibility
• Dosha analysis (Mangal, Nadi, Bhakoot)
• Marriage timing predictions

**💑 Marriage Guidance:**
• Best marriage timings
• Auspicious wedding dates
• Planetary influences on relationships
• Remedies for relationship issues

**🌟 Love & Romance:**
• Venus (Shukra) influence
• 7th house analysis
• Spouse characteristics
• Relationship remedies

**For detailed analysis:**
1. Create your Kundli
2. Create your partner's Kundli
3. Use our Kundli matching service
4. Get comprehensive compatibility report

Would you like to know about Kundli matching or marriage timing predictions?`;
  }

  if (message.includes('career') || message.includes('job') || message.includes('business')) {
    return `💼 **Career & Business Astrology**

I can guide you on career and business through Vedic astrology:

**📈 Career Guidance:**
• 10th house analysis (career)
• Planetary influences on profession
• Best career timings
• Job change predictions

**💼 Business Astrology:**
• Business timing analysis
• Partnership compatibility
• Financial success indicators
• Business remedies

**🌟 Professional Success:**
• Sun (authority) influence
• Mercury (business) guidance
• Jupiter (wisdom) benefits
• Saturn (discipline) effects

**For detailed career analysis:**
1. Create your Kundli
2. Analyze 10th house and planets
3. Check current Dasha period
4. Get career timing predictions

Would you like career guidance or business timing analysis?`;
  }

  if (message.includes('health') || message.includes('disease') || message.includes('medical')) {
    return `🏥 **Health & Medical Astrology**

I can provide health guidance through Vedic astrology:

**🔍 Health Analysis:**
• 6th house (health) analysis
• Planetary influences on health
• Disease timing predictions
• Health remedies

**🌟 Planetary Health:**
• Sun: Heart, eyes, vitality
• Moon: Mind, emotions, blood
• Mars: Blood, muscles, energy
• Mercury: Nervous system, skin
• Jupiter: Liver, wisdom, growth
• Venus: Reproductive system, beauty
• Saturn: Bones, joints, longevity

**🛠️ Health Remedies:**
• Gemstone therapy
• Mantra chanting
• Puja and rituals
• Lifestyle changes

**For health analysis:**
1. Create your Kundli
2. Analyze 6th house and planets
3. Check health-related Dasha periods
4. Get health timing predictions

Would you like health analysis or medical astrology guidance?`;
  }

  return `🤔 **Intelligent Astrology Guidance**

That's an interesting question! I'm designed to provide intelligent, context-aware responses about Vedic astrology and spirituality.

**I can help you with:**
• **Specific astrological concepts** - Ask about planets, houses, Dasha periods
• **Personal analysis** - Create your Kundli for detailed insights
• **Spiritual practices** - Puja, meditation, mantras
• **Gemstone guidance** - Personalized recommendations
• **Life guidance** - Career, relationships, health, timing

**For the best experience:**
1. **Be specific** about what you want to know
2. **Create your Kundli** for personalized analysis
3. **Ask follow-up questions** for deeper insights

**What specific aspect of astrology or spirituality interests you?** I can provide detailed, intelligent guidance on any topic!`;
}
