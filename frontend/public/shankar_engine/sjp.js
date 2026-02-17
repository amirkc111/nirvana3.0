console.log("sjp.js.............");
//All Globals
var DEBUG = true;

//Date proto: add day mon year to have BC years.
Date.prototype.day = 1;
Date.prototype.month = 1;
Date.prototype.year = 1;

var minutes = 1000 * 60; //Milliseconds
var hours = minutes * 60;//Milliseconds
var day = hours * 24;//Milliseconds
var kali2julian = 588466;//Ahargana to subtract from Julian date to get kali ahargana.
var t; //t : number of Julian centuries since J2000.0 t = ((jd - 2415020) + f/24 - 0.5)/36525;
var nakshatra = ["Ashvini-Ke", "Bharani-Ve", "Kritika-Su", "Rohini-Mo", "Mrigashira-Ma", "Ardra-Ra", "Punarvasu-Ju", "Pushya-Sa", "Ashlesha-Me", "Magha-Ke", "Purva Phalguni-Ve", "Uttara Phalguni-Su", "Hasta-Mo", "Chitra-Ma", "Swati-Ra", "Vishakha-Ju", "Anuradha-Sa", "Jyeshtha-Me", "Mula-Ke", "Purva Ashadha-Ve", "Uttara Ashadha-Su", "Shravan-Mo", "Dhanistha-Ma", "Shatabhishaj-Ra", "Purva Bhadrapad-Ju", "Uttara Bhadrapad-Sa", "Revati-Me"];
var nakshatra_s = ["As", "Bh", "Kr", "Ro", "Mr", "Ar", "Pv", "Pu", "As", "Mg", "PP", "UP", "Ha", "Ch", "Sw", "Vi", "An", "Jy", "Mu", "UA", "PA", "Sr", "Dh", "Sh", "PB", "UB", "Re"];
var yogas = ["Vishkambha-विष्कम्भ-(Sa)", "Priti-प्रीति-(Me)", "Ayushman-आयुष्मान-(Ke)", "Saubhagya-सौभाग्य-(Ve)", "Shobhana-शोभन-(Su)", "Atiganda-अतिगण्ड -(Mo)", "Sukarman-सुकर्मा -(Ma)", "Dhriti-धृति -(Ra)", "Shula-शूल -(Ju)", "Ganda-गण्ड -(Sa)", "Vriddhi-वृद्धि -(Me)", "Dhruva-ध्रुव -(Ke)", "Vyaghata-व्याघात-(ve)", "Harshana-हर्षण-(su)", "Vajra-वज्र-(Mo)", "Siddhi-सिद्धि-(Ma)", "Vyatipata-व्यतिपात-(Ra)", "Varigha-वरीयस्-(Ju)", "Parigha-परिघ-(Sa)", "Shiva-शिव-(Me)", "Siddha-सिद्ध-(Ke)", "Sadhya-साध्य-(Ve)", "Shubha-शुभ-(Su)", "Shukla-शुक्ल-(Mo)", "Brahma-ब्रह्म-(Ma)", "Mahendra-महेन्द्र-(Ra)", "Vaidhriti-वैधृति"];
var yoga_s = ["Viवि", "Priप्री", "Ayuआ", "Sauसौ", "Shoशो", "Atiअति", "Suसु", "Dhrधृ", "Shuशू", "Ganग", "Vriवृ", "Dhruध्रु", "Vyagव्या", "Harह", "Vajव", "Sidhiसिद्धि", "Vyatव्यति", "Var-व", "Paप", "Shiशि", "Sidhaसिद्ध", "Saaसाध्य", "Shuशु", "Shukशुक्ल", "Braब्रह्म", "Maheमहेन्द्र", "Vaiवैधृति"];
var karana_deity = ["Indra", "Brahma", "Mitra", "Aryamana", "Pritvi", "Lakshmi", "Yama", "Kali", "Shiva", "Naaga", "Vaayu"];
var vaara_deity = ["Shiva", "Durga", "Skanda", "Vishnu", "Brahma", "Indra", "Kaala"];
var tithi_deity = ["Pitru", "Agni", "Brahma", "Gauri", "Ganesha", "Naaga", "Skanda", "Surya", "Rudra", "Durga", "Yama", "Vishwadeva", "Vishnu", "Kaamadeva", "Shiva", "Chandra"];
var yoga_deity = ["Yama", "Vishnu", "Chandra/Soma", "Brahma", "Brihaspati", "Chandrama", "Indra"/*Sukarma*/, "Jala", "Sarpa"/*Shoola*/, "Agni", "Surya", "Bhumi", "Vaayu", "Bhaga", "Varuna", "Ganesha", "Rudra", "Kubera", "Vishwakarma", "Mitra", "Karthikeya", "Saavitri", "Lakshmi", "Parvati", "AshwiniKumara", "Pitra", "Diti"];
var tithi = ["Shukla Prathamai 1-Su", "Shukla Dwitiya 2-Mo", "Shukla Tritiya 3-Ma", "Shukla Chaturthi 4-Me", "Shukla Panchami 5-Ju", "Shukla Shashti 6-Ve", "Shukla Saptami 7-Sa", "Shukla Ashtami 8-Ra", "Shukla Navami 9-Su", "Shukla Dasami 10-Mo", "Shukla Ekadashi 11-Ma", "Shukla Dwadasi 12-Me", "Shukla Trayodasi 13-Ju", "Shukla Chaturdashi 14-Ve", "Poornima Full-Sa", "Krishna Prathamai 1-Su", "Krishna Dwitiya 2-Mo", "Krishna Tritiya 3-Ma", "Krishna Chaturthi 4-Me", "Krishna Panchami 5-Ju", "Krishna Shashti 6-Ve", "Krishna Saptami 7-Sa", "Krishna Ashtami 8-Ra", "Krishna Navami 9-Su", "Krishna Dasami 10-Mo", "Krishna Ekadashi 11-Ma", "Krishna Dwadasi 12-Me", "Krishna Trayodasi 13-Ju", "Krishna Chaturdashi 14-Sa", "Amavasya New-Ra"];
var tithi_s = ["S1", "S2", "S3", "S4", "S4", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "Pur", "K1", "K2", "K3", "K4", "K4", "K6", "K7", "K8", "K9", "K10", "K11", "K12", "K13", "K14", "Ama"];
var vara = ["Sun-Sunday", "Moon-Monday", "Mars-Tuesday", "Mercury-Wednesday", "Jupiter-Thursday", "Venus-Friday", "Saturn-Saturday"];
var vara_s = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var karana = ["Kimstugna-L10/Ke", "Bhava-Su", "Bhaalava-Mo", "Kaulava-Ma", "Taitula-Me", "Garija-Ju", "Vanija-Ve", "Vishti-Sa", "Bhava-Su", "Bhaalava-Mo", "Kaulava-Ma", "Taitula-Me", "Garija-Ju", "Vanija-Ve", "Vishti-Sa", "Bhava-Su", "Bhaalava-Mo", "Kaulava-Ma", "Taitula-Me", "Garija-Ju", "Vanija-Ve", "Vishti-Sa", "Bhava-Su", "Bhaalava-Mo", "Kaulava-Ma", "Taitula-Me", "Garija-Ju", "Vanija-Ve", "Vishti-Sa", "Bhava-Su", "Bhaalava-Mo", "Kaulava-Ma", "Taitula-Me", "Garija-Ju", "Vanija-Ve", "Vishti-Sa", "Bhava-Su", "Bhaalava-Mo", "Kaulava-Ma", "Taitula-Me", "Garija-Ju", "Vanija-Ve", "Vishti-Sa", "Bhava-Su", "Bhaalava-Mo", "Kaulava-Ma", "Taitula-Me", "Garija-Ju", "Vanija-Ve", "Vishti-Sa", "Bhava-Su", "Bhaalava-Mo", "Kaulava-Ma", "Taitula-Me", "Garija-Ju", "Vanija-Ve", "Vishti-Sa", "Shakuni-L1/Ra", "Chatushpada-L4/Ra", "Naaga-L7/Ke"];
var karana_s = ["Ki", "Bv", "Bl", "Ka", "Ta", "Ga", "Va", "Vi", "Bv", "Bl", "Ka", "Ta", "Ga", "Va", "Vi", "Bv", "Bl", "Ka", "Ta", "Ga", "Va", "Vi", "Bv", "Bl", "Ka", "Ta", "Ga", "Va", "Vi", "Bv", "Bl", "Ka", "Ta", "Ga", "Va", "Vi", "Bv", "Bl", "Ka", "Ta", "Ga", "Va", "Vi", "Bv", "Bl", "Ka", "Ta", "Ga", "Va", "Vi", "Bv", "Bl", "Ka", "Ta", "Ga", "Va", "Vi", "Sh", "Ch", "Na"];
var graha = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]; //Normal Graha Sequence (Vara Sequence)
var caughadiya = ["Udvega-Su", "Chara-Ve", "Laabha-Me", "Amrit-Mo", "Kaala-Sa", "Shubha-Ju", "Roga-Ma"];
var muhurtha = ["1:Rudra-Ardra --", "2:Ahi-Aslesha --", "3:Mitra-Anuradha", "4:Pitri-Magha --", "5:Vasu-Dhanishtha", "6:Ambu-Purvashadha", "7:Visvadeva-Uttarashadha", "8:Abhijit/Vidhi-Abhijit", "9:Vidhata/Satamuki-Rohini", "10:Puruhuta-Jyeshtha --", "11:Indragni/Vahni-Visakha --", "12:Nirriti/Naktancara-Mula --", "13:Varuna/Udakanatha-Satabhisha", "14:Aryaman-Uttaraphalguni", "15:Bhaga-Purvaphalguni --", "n1:Girisa-Ardra --", "n2:Ajapada-Purvabhadrapada", "n3:Ahirbudhnya-Uttarabhadrapada", "n4:Pushan-Revati", "n5:Asvi-Asvini", "n6:Yama-Bharani --", "n7:Agni-Krittika --", "n8:Vidhaatri-Rohini", "n9:Chanda-Mrigasira", "n10:Aditi-Punarvasu", "n11:Jiiva-Pushya", "n12:Vishnu-Sravana", "n13:Arka-Hasta", "n14:Tvashtri-Chitra", "n15:Maruta-Svati"];
var week_days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var hora = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
var GulikaChakra = ["Kaala", "-", "Mrityu", "Ardhaprahara", "Yamaghanta", "-", "Gulika"];
var asRashi = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanura", "Makara", "Kumbha", "Meena"];
var MaandiGunanka = [26 / 30, 22 / 30, 18 / 30, 14 / 30, 10 / 30, 6 / 30, 2 / 30, 30 / 30]; //In Weekday order; Take 5th for night time
var kaalachakra = [0, 2, 4, 3, 5, 6, 1, 7]; //Kaalachakra sequence
var kaalachakra_start = [0, 6, 1, 3, 2, 4, 5];
var caughadia_start = [0, 3, 6, 2, 5, 1, 4];
var vimshottari = [0, 1, 2, 7, 4, 6, 3, 8, 5]; //Vimshottari Sequence
var order = [0, 3, 6, 2, 5, 1, 4];
var nakshatra_size = 13 + 1 / 3; //Nakshatra Size in degrees.

var samvatsara = ["Prabhava", "Vibhava", "Shukla", "Pramodoota", "Prajothpatti", "Āngirasa", "Shrīmukha", "Baāva", "Yuva", "Dhātru", "Īshvara", "Bahudhānya", "Pramāthi", "Vikrama", "Vrusha", "Chitrabhānu", "Svabhānu", "Tārana", "Pārthiva", "Vyaya", "Sarvajith", "Sarvadhāri", "Virodhi", "Vikruta", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi", "Hevilambi", "Vilambi", "Vikāri", "Shārvari", "Plava", "Shubhakrutha", "Shobhakrutha", "Krodhi", "Vishvāvasu", "Parābhava", "Plavanga", "Kīlaka", "Saumya", "Sādhārana", "Virodhikrutha", "Paridhāvi", "Pramādeecha", "Ānanda", "Rākshasa", "Anala", "Pingala", "Kālayukthi", "Siddhārthi", "Raudra", "Durmathi", "Dundubhi", "Rudhirodgāri", "Raktākshi", "Krodhana", "Akshaya"];
var aPanchaSamvatsara = ["Idvatsara(Rudra)-5th", "Samvatsara(Agni)-1st", "Parivatsara(Aditya)-2nd", "Idaavatsara(Vaayu)-3rd", "Anuvatsara(Indu)-4th", "Idvatsara(Rudra)-5th"];
//var KaliBaseDate = new Date(5070, 7, 19, 5, 30, 0, 0);//2017 = 5117–5118
var KaliBaseDate = new Date(-3102, 1, 18, 17, 30, 0, 0);//18 February 3102 BCE 12:00 IST or 17:30 GMT Add this to any date for Kali Dae
var panchanga;
var timerID;
var TimeZoneOffset;
//onerror=handleErr;
var txt = "";
var doc;
var params; //The URL Parameters passed to this page.
var places = new MyArray();
var places_file = "places.txt";
var xml_file_opened = false;
var places_const = "Ujjain#75.769;23.1833;5.5&Puri#85.83;19.81;5.5&New Delhi#77.208833;28.613806;5.5&Chennai#80.2826;13.0838;5.5&WashingtonDC#-77.0366;38.8977;-5.0"; //Default Places
//var places_c=places_const;
var chart = [
    { "text": "Asc/Lagna   ", "long": 0, "retro": " - ", "speed": 0, "id": 0, "bhava": 0, "tx": "Lg", "order": 0, "ck": "" },
    { "text": "Sun/Surya   ", "long": 0, "retro": "", "speed": 0, "id": 1, "bhava": 0, "tx": "Su", "order": 1, "ck": "" },
    { "text": "Moon/Chandra", "long": 0, "retro": "", "speed": 0, "id": 2, "bhava": 0, "tx": "Mo", "order": 2, "ck": "" },
    { "text": "Mars/Mangal ", "long": 0, "retro": "", "speed": 0, "id": 3, "bhava": 0, "tx": "Ma", "order": 3, "ck": "" },
    { "text": "Merc/Buddha ", "long": 0, "retro": "", "speed": 0, "id": 4, "bhava": 0, "tx": "Me", "order": 4, "ck": "" },
    { "text": "Jupiter/Guru", "long": 0, "retro": "", "speed": 0, "id": 5, "bhava": 0, "tx": "Ju", "order": 5, "ck": "" },
    { "text": "Venus/Shukra", "long": 0, "retro": "", "speed": 0, "id": 6, "bhava": 0, "tx": "Ve", "order": 6, "ck": "" },
    { "text": "Saturn/Shani", "long": 0, "retro": "", "speed": 0, "id": 7, "bhava": 0, "tx": "Sa", "order": 7, "ck": "" },
    { "text": "Rahu        ", "long": 0, "retro": "", "speed": 0, "id": 8, "bhava": 0, "tx": "Ra", "order": 9, "ck": "" },
    { "text": "Ketu        ", "long": 0, "retro": "", "speed": 0, "id": 9, "bhava": 0, "tx": "Ke", "order": 9, "ck": "" }
];
var varga = [["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
["Dx", "Surya", "Chandra", "Mangal", "Budha", "Guru", "Shukra", "Shani", "Rahu", "Ketu", "Gulika", "Mandi", "PranaP", "BL", "HL", "GL"],
];
var PakshiActivity = [
    [//Shukla Paksha
        ["Sunday Tuesday", "Eagle", "Eat", "Walk", "Rule", "Sleep", "Death", "Death", "Rule", "Eat", "Sleep", "Walk"],
        ["Sunday Tuesday", "Owl", "Walk", "Rule", "Sleep", "Death", "Eat", "Walk", "Death", "Rule", "Eat", "Sleep"],
        ["Sunday Tuesday", "Crow", "Rule", "Sleep", "Death", "Eat", "Walk", "Sleep", "Walk", "Death", "Rule", "Eat"],
        ["Sunday Tuesday", "Cock", "Sleep", "Death", "Eat", "Walk", "Rule", "Eat", "Sleep", "Walk", "Death", "Rule"],
        ["Sunday Tuesday", "Peacock", "Death", "Eat", "Walk", "Rule", "Sleep", "Rule", "Eat", "Sleep", "Walk", "Death"],
        ["Monday  Wednesday", "Eagle", "Death", "Eat", "Walk", "Rule", "Sleep", "Walk", "Death", "Rule", "Eat", "Sleep"],
        ["Monday  Wednesday", "Owl", "Eat", "Walk", "Rule", "Sleep", "Death", "Sleep", "Walk", "Death", "Rule", "Eat"],
        ["Monday  Wednesday", "Crow", "Walk", "Rule", "Sleep", "Death", "Eat", "Eat", "Sleep", "Walk", "Death", "Rule"],
        ["Monday  Wednesday", "Cock", "Rule", "Sleep", "Death", "Eat", "Walk", "Rule", "Eat", "Sleep", "Walk", "Death"],
        ["Monday  Wednesday", "Peacock", "Sleep", "Death", "Eat", "Walk", "Rule", "Death", "Rule", "Eat", "Sleep", "Walk"],
        ["Thursday", "Eagle", "Sleep", "Death", "Eat", "Walk", "Rule", "Sleep", "Walk", "Death", "Rule", "Eat"],
        ["Thursday", "Owl", "Death", "Eat", "Walk", "Rule", "Sleep", "Eat", "Sleep", "Walk", "Death", "Rule"],
        ["Thursday", "Crow", "Eat", "Walk", "Rule", "Sleep", "Death", "Rule", "Eat", "Sleep", "Walk", "Death"],
        ["Thursday", "Cock", "Walk", "Rule", "Sleep", "Death", "Eat", "Death", "Rule", "Eat", "Sleep", "Walk"],
        ["Thursday", "Peacock", "Rule", "Sleep", "Death", "Eat", "Walk", "Walk", "Death", "Rule", "Eat", "Sleep"],
        ["Friday ", "Eagle", "Rule", "Sleep", "Death", "Eat", "Walk", "Eat", "Sleep", "Walk", "Death", "Rule"],
        ["Friday ", "Owl", "Sleep", "Death", "Eat", "Walk", "Rule", "Rule", "Eat", "Sleep", "Walk", "Death"],
        ["Friday ", "Crow", "Death", "Eat", "Walk", "Rule", "Sleep", "Death", "Rule", "Eat", "Sleep", "Walk"],
        ["Friday ", "Cock", "Eat", "Walk", "Rule", "Sleep", "Death", "Walk", "Death", "Rule", "Eat", "Sleep"],
        ["Friday ", "Peacock", "Walk", "Rule", "Sleep", "Death", "Eat", "Sleep", "Walk", "Death", "Rule", "Eat"],
        ["Saturday", "Eagle", "Walk", "Rule", "Sleep", "Death", "Eat", "Rule", "Eat", "Sleep", "Walk", "Death"],
        ["Saturday", "Owl", "Rule", "Sleep", "Death", "Eat", "Walk", "Death", "Rule", "Eat", "Sleep", "Walk"],
        ["Saturday", "Crow", "Sleep", "Death", "Eat", "Walk", "Rule", "Walk", "Death", "Rule", "Eat", "Sleep"],
        ["Saturday", "Cock", "Death", "Eat", "Walk", "Rule", "Sleep", "Sleep", "Walk", "Death", "Rule", "Eat"],
        ["Saturday", "Peacock", "Eat", "Walk", "Rule", "Sleep", "Death", "Eat", "Sleep", "Walk", "Death", "Rule"]
    ],
    [////Krishna Paksha
        ["Sunday Tuesday", "Cock", "Eat", "Walk", "Death", "Sleep", "Rule", "Walk", "Eat", "Rule", "Sleep", "Death"],
        ["Sunday Tuesday", "Eagle", "Death", "Eat", "Sleep", "Rule", "Walk", "Death", "Sleep", "Eat", "Walk", "Rule"],
        ["Sunday Tuesday", "Owl", "Sleep", "Death", "Rule", "Walk", "Eat", "Rule", "Walk", "Sleep", "Death", "Eat"],
        ["Sunday Tuesday", "Peacock", "Rule", "Sleep", "Walk", "Eat", "Death", "Eat", "Death", "Walk", "Rule", "Sleep"],
        ["Sunday Tuesday", "Crow", "Walk", "Rule", "Eat", "Death", "Sleep", "Sleep", "Rule", "Death", "Eat", "Walk"],
        ["Monday Saturday", "Cock", "Rule", "Sleep", "Walk", "Eat", "Death", "Eat", "Death", "Walk", "Rule", "Sleep"],
        ["Monday Saturday", "Eagle", "Walk", "Rule", "Eat", "Death", "Sleep", "Sleep", "Rule", "Death", "Eat", "Walk"],
        ["Monday Saturday", "Owl", "Eat", "Walk", "Death", "Sleep", "Rule", "Walk", "Eat", "Rule", "Sleep", "Death"],
        ["Monday Saturday", "Peacock", "Death", "Eat", "Sleep", "Rule", "Walk", "Death", "Sleep", "Eat", "Walk", "Rule"],
        ["Monday Saturday", "Crow", "Sleep", "Death", "Rule", "Walk", "Eat", "Rule", "Walk", "Sleep", "Death", "Eat"],
        ["Wednesday", "Cock", "Sleep", "Death", "Rule", "Walk", "Eat", "Death", "Sleep", "Eat", "Walk", "Rule"],
        ["Wednesday", "Eagle", "Rule", "Sleep", "Walk", "Eat", "Death", "Rule", "Walk", "Sleep", "Death", "Eat"],
        ["Wednesday", "Owl", "Walk", "Rule", "Eat", "Death", "Sleep", "Eat", "Death", "Walk", "Rule", "Sleep"],
        ["Wednesday", "Peacock", "Eat", "Walk", "Death", "Sleep", "Rule", "Sleep", "Rule", "Death", "Eat", "Walk"],
        ["Wednesday", "Crow", "Death", "Eat", "Sleep", "Rule", "Walk", "Walk", "Eat", "Rule", "Sleep", "Death"],
        ["Thursday", "Cock", "Walk", "Rule", "Eat", "Death", "Sleep", "Rule", "Walk", "Sleep", "Death", "Eat"],
        ["Thursday", "Eagle", "Eat", "Walk", "Death", "Sleep", "Rule", "Eat", "Death", "Walk", "Rule", "Sleep"],
        ["Thursday", "Owl", "Death", "Eat", "Sleep", "Rule", "Walk", "Sleep", "Rule", "Death", "Eat", "Walk"],
        ["Thursday", "Peacock", "Sleep", "Death", "Rule", "Walk", "Eat", "Walk", "Eat", "Rule", "Sleep", "Death"],
        ["Thursday", "Crow", "Rule", "Sleep", "Walk", "Eat", "Death", "Death", "Sleep", "Eat", "Walk", "Rule"],
        ["Friday", "Cock", "Death", "Eat", "Sleep", "Rule", "Walk", "Sleep", "Rule", "Death", "Eat", "Walk"],
        ["Friday", "Eagle", "Sleep", "Death", "Rule", "Walk", "Eat", "Walk", "Eat", "Rule", "Sleep", "Death"],
        ["Friday", "Owl", "Rule", "Sleep", "Walk", "Eat", "Death", "Death", "Sleep", "Eat", "Walk", "Rule"],
        ["Friday", "Peacock", "Walk", "Rule", "Eat", "Death", "Sleep", "Rule", "Walk", "Sleep", "Death", "Eat"],
        ["Friday", "Crow", "Eat", "Walk", "Death", "Sleep", "Rule", "Eat", "Death", "Walk", "Rule", "Sleep"]
    ]
];

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var zn = "AriTauGemCanLeoVirLibScoSagCapAquPis";  // Zodiac
var d2r = Math.PI / 180;    // degrees to radians
var r2d = 180 / Math.PI;    // radians to degrees
//var range = [1,12,1,31,1800,2100,0,23,0,59,0,12,0,59,0,0,0,179,0,59,0,0,0,89,0,59];
var xmlHttp;


//END ALL GLOBALS

function debug() {
    if (!DEBUG) return;
    k = "Verify values...";
    for (i = 0; i < arguments.length; ++i)k += "--\n" + arguments[i];
    console.log(k);
    return;
}
function handleErr(msg, url, l) {
    txt = "There was an error on this page.\n\n";
    txt += "Error: " + msg + "\n";
    txt += "URL: " + url + "\n";
    txt += "Line: " + l + "\n\n";
    txt += "Click OK to continue.\n\n";
    console.log(txt);
    return true;
}
Date.prototype.getJulian = function () {
    return Math.floor((this / 86400000) - (this.getTimezoneOffset() / 1440) + 2440587.5);
}
Date.prototype.getAhargana = function () {
    return Math.ceil(this / 86400000 + 1852121);
}
Date.prototype.getKaliAbda = function () {
    KaliYear = this.getFullYear() + 3101;
    BeforeApr14 = (this.getMonth() * 31 + this.getDate()) > 104 ? 0 : 1; //Jan to April 14th (31+28+31+14 = 104 days )
    KaliYear = KaliYear - BeforeApr14;
    return KaliYear;
}

Date.prototype.setLocalHMS0 = function () {
    this.setHours(0);
    this.setMinutes(0);
    this.setSeconds(0);
    this.setMilliseconds(0);
}
Date.prototype.setUtcHMS0 = function () {
    this.setUTCHours(0);
    this.setUTCMinutes(0);
    this.setUTCSeconds(0);
    this.setUTCMilliseconds(0);
}
Date.prototype.getMyTimezoneOffset = function () {
    if (Date.MyTimezoneOffset == null) {
        var t = new Date();
        Date.MyTimezoneOffset = t.getTimezoneOffset();
    }
    return Date.MyTimezoneOffset;
}
Date.prototype.setMyTimezoneOffset = function (t) {//In Minutes -ve for east
    return Date.MyTimezoneOffset = t;
}


// Function to check if a year is a leap year
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Function to get the day of the year for a given date
function getDayOfYear(fullYear, month, date) {
    const year = fullYear;//date.getFullYear();
    const isLeap = isLeapYear(year);
    const daysInMonth = [
        31, 28 + isLeap, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ];

    let dayOfYear = 0;

    for (let m = 0; m < month; m++) {
        dayOfYear += daysInMonth[m];
    }

    dayOfYear += date;

    return dayOfYear;
}

function ParseLatLong(s) {

    /*
    "Various Types
    Decimal degrees: 41.40338, 2.17403
    Degrees, minutes, and seconds: 41°24'12.2"N 2°10'26.5"E
    lat,long = 39n17, 76w37; 
    13.0838N 80.2826E
    
    */
    let location = [null, null]; //Function return object
    let text = s.toUpperCase();
    let latitude = /(\d+)\s*([nNsS])\s*([\d\.]+)/gi;
    let longitude = /(\d+)\s*([eEwW])\s*([\d\.]+)/gi;
    result = latitude.exec(text);
    if (result != null) {
        lat = result[1] * 1 + result[3] / 60;
        if (result[2] == "W") long *= -1;
    }
    result = longitude.exec(text);
    if (result != null) {
        long = result[1] * 1 + result[3] / 60;
        if (result[2] == "W") long *= -1;
    }
    latitude = /(\d+)\s*°\s*(\d+)\s*\'\s*([\d\.]+)\s*\"\s*([NnSs])/gi;
    longitude = /(\d+)\s*°\s*(\d+)\s*\'\s*([\d\.]+)\s*\"\s*([EeWw])/gi;
    result = latitude.exec(text);
    if (result != null) {
        lat = result[1] * 1 + result[2] / 60 + result[3] / 60 / 60;
        if (result[4] == "S") lat *= -1;
    }
    result = longitude.exec(text);
    if (result != null) {
        long = result[1] * 1 + result[2] / 60 + result[3] / 60 / 60;
        if (result[4] == "W") long *= -1;
    }
    latlong = /([\+\-\d]+\.\d+)\s*\,\s*([\+\-\d]+\.\d+)/gi;
    result = latlong.exec(text);
    if (result != null && result.length == 3) {
        lat = result[1] * 1;
        long = result[2] * 1;
    }
    latlong = /([\d]+\.\d+)\s*([nNsS])[\,\s]+([\+\-\d]+\.\d+)\s*([eEwW])/gi;
    result = latlong.exec(text);
    if (result != null) {
        lat = result[1] * 1;
        if (result[2] == "S") lat *= -1;
        long = result[3] * 1;
        if (result[4] == "W") long *= -1;
    }
    if (typeof (lat) != 'undefined') location[0] = lat;
    if (typeof (long) != 'undefined') location[1] = long;
    return location;
}

function UpdatePlaceLatLong() { //Even of Lat Long Change
    p = ParseLatLong(document.getElementById("placename").value);
    console.log(p);
    if (p[0] != 0 && p[0] != null) document.getElementById("latitude").value = 1 * p[0];
    if (p[1] != 0 && p[1] != null) document.getElementById("longitude").value = 1 * p[1];
    h = parseTZ(document.getElementById("placename").value);
    if (h != null) document.getElementById("timezone").value = h;
}
function parseDate(str) {
    // dd mmmMMMMMM yyyy
    const datestr = /(\d\d*)\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\w*\s*(\d\d\d\d)/;
    let upperstr = str.toUpperCase();
    result = datestr.exec(upperstr);
    if (result != null) {
        return new Date(result[1] + " " + result[2] + " " + result[3]);
    }
    //Aug 18, 1959
    const dateRegEx2 = /(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\w*\s*(\d\d*)\s*\,\s*(\d\d\d\d)/;
    upperstr = str.toUpperCase();
    result = dateRegEx2.exec(upperstr);
    if (result != null) {
        return new Date(result[1] + " " + result[2] + " " + result[3]);
    }
    return null;//If no dates found.
}
function parseTime(str) {
    const datestr = /(\d\d*):(\d\d*)/;
    let upperstr = str.toUpperCase();
    result = datestr.exec(upperstr);
    d = null;
    if (result != null) {
        d = new Date();
        d.setHours(result[1]);
        d.setMinutes(result[2]);
        d.setSeconds(0);
        if (upperstr.search("PM") > -1) {
            if (d.getHours() < 12) d.setHours(1 * result[1] + 12);
        }
    }
    return d;
}
function parseTZ(str) {
    const datestr = /H(\d+)[EW](\d*)/;
    let upperstr = str.toUpperCase();
    result = datestr.exec(upperstr);
    d = null;
    if (result != null) {
        d = result[1] * 1;
        if (result.index >= 2) d += result[2] / 60;
        if (upperstr.search("W") > -1) d *= -1;
    }
    const tz2 = /UTC[+-](\d+)[:]*(\d*)/;
    result = tz2.exec(upperstr);
    if (result != null) {
        d = result[1] * 1;
        if (result.index >= 2) d += result[2] / 60;
        if (upperstr.search("-") > -1) d *= -1;
    }
    const tz3 = /[+-](\d\d)[:](\d\d)/;
    result = tz3.exec(upperstr);
    if (result != null) {
        d = result[1] * 1;
        if (result.index >= 2) d += result[2] / 60;
        if (upperstr.search("-") > -1) d *= -1;
    }
    const tz4 = /\d+(Z)/;
    result = tz4.exec(upperstr);
    if (result != null) d = 0;// "Z" after digits is universal timezone 00:00:
    return d;
}
function UpdateChartName() {//Event on Chartname change
    date = parseDate(document.getElementById("chartname").value);
    if (date != null) updateDMY(date);
    date = parseTime(document.getElementById("chartname").value);
    if (date != null) document.getElementById("btime").value = formatTimeSS(date);
}

function updateDMY(date) {
    document.getElementById("day").value = date.getDate();
    document.getElementById("month").value = date.getMonth() + 1;
    document.getElementById("year").value = date.getFullYear();
}

function initCurrentHMSDMY() {
    var d = new Date();
    document.getElementById("btime").value = formatTimeSS(d)
    //document.getElementById("hours").value =d.getHours();
    //document.getElementById("mins").value =d.getMinutes();
    //document.getElementById("secs").value =d.getSeconds();
    document.getElementById("day").value = d.getDate();
    document.getElementById("month").value = d.getMonth() + 1;
    document.getElementById("year").value = d.getFullYear();
    //alert("Setting curret date to"+d)
}
function getLagnaTable(AscData, date_time, longitude, latitude) {
    this.html = "<table border=2><tr><th>Lagna</th><th>Ending Time(Local Time)</th>";
    var previous = Math.floor(AscData.Ascendant / 30);
    var a = new Date(date_time);
    for (var i = 0; i < 24 * 60; ++i) {
        a.setMinutes(a.getMinutes() + 1);
        l = new calculateAscendant(a, latitude, longitude);
        var next = Math.floor(l.Ascendant / 30)
        if (next != previous) {
            this.html += "<tr><td>" + asRashi[previous] + "</td><td>" + a.toLocaleString() + "</td></tr>";
            //console.log("gp:"+a+"-"+i+"-"+l.Ascendant);
            previous = next;
        }
    }
    this.html += "</table>";
    return this;
}

// Function to download data to a file
function download_old(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
function download(data, filename, type) {
    var blob = new Blob([data], { type: 'application/octet-stream' });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    // Append to the body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

function getJHDStringEsc(parray) {
    //Create JHD file as below
    //Line1:MONTH
    //Line2:DATE
    //Line3:YEAR (digit)
    //Line4:HH.MMmmmmmm(where Hours.MMmmmm mm is decimals of minutes after .)
    //Line5:-HH.MMmmmmmm(TimeZone -ve is east Hours.MMmmmm)
    //Line6:-DD.MMmmmm (Longitudes -ve is east Degrees.MMmmmm)
    //Line7:DD.MMmmmm (Latitude Degrees.MMmmmm)
    //Line8:MM.mmmmmm (Altitude meters)
    //Line9:-HH.dddddd(Winter TimeZone -ve is east, but here is in decimals)
    //Line10:-HH.dddddd(Daylight TimeZone -ve is east,but here is in decimals)
    //Line11:0 ( 1 is time in 24Hours format 0 is AM/PM)
    //Line12:105 (Is this Mean Sea level? What is this? Changes with location selection?)
    //Line13:Location (Location in Names)
    //Line14:India (Country in names)
    //Line15:1 (If  1 to use atmospheric pressure)
    //Line16:88.000000 (Atmospheric pressure)
    //Line17:99.000000 (temperature)
    //Line18:1 (If 1 use temperature for calculations)
    //chartname=Sanjay+Prabhakaran.jhd,submit=Calculate,&day=25&month=6&year=2024,btime=09%3A15%3A20,timezone=5.5000,placename=Karur%5ECIM%5EStore%2CIndia,longitude=-78.050949,latitude=10.577872
    var d = new Date("1/1/1970" + " " + decodeURIComponent(parray['btime']));
    str = ''
        + parray['month'] + '\r\n'  //Line1:MONTH
        + parray['day'] + '\r\n' //Line2:DATE
        + parray['year'] + '\r\n'  //Line3:YEAR (digit)
        + (d.getHours() * 1 + d.getMinutes() / 100 + d.getSeconds() / 10000).toFixed(6) + '\r\n' //HH.MMmmmmmm(where Hours.MMmmmm mm is decimals of minutes after .)
        + parseFloat((-parseInt(parray['timezone'])) + "." + (parray['timezone'] % 1 * 60).toFixed(0)).toFixed(6) + '\r\n' //Line5:-HH.MMmmmm(TimeZone -ve is east Hours.MMmmmm)
        + -1 * parray['longitude'] + '\r\n'  //Line6:-DD.MMmmmm (Longitudes -ve is east Degrees.MMmmmm)
        + parray['latitude'] + '\r\n' //Line7:DD.MMmmmm (Latitude Degrees.MMmmmm)
        + "00.000" + "\n" //Altitude //Line8:MM.mmmmmm (Altitude meters)
        + (-parray['timezone']) + '\r\n' //Line9:-HH.dddddd(Winter TimeZone -ve is east, but here is in decimals)
        + (-parray['timezone']) + '\r\n' //Line10:-HH.dddddd(Daylight TimeZone -ve is east,but here is in decimals)
        + "1\r\n" //Line11:0 ( 1 is time in 24Hours format 0 is AM/PM)
        + "105\r\n" //sea level? //Line12:105 (Is this Mean Sea level? What is this? Changes with location selection?)
        + parray['placename'] + "\r\n" //place //Line13:Location (Location in Names)
        + parray['placename'] + "\r\n" //country //Line14:India (Country in names)
        + "0\r\n"   //Line15:1 (If  1 to use atmospheric pressure)
        + "88.000000\r\n" //Line16:88.000000 (Atmospheric pressure)
        + "99.000000\r\n" //Line17:99.000000 (temperature)
        + "0\r\n"//Line18:1 (If 1 use temperature for calculations)
        ;
    download(str, parray['chartname'] + ".jhd", "text");
    //return str;
}


/// the getPanchanga function take,
/// INPUT VALUES: datetime, long and latitude.
/// RETURN VALUES: It returns an object with all the panchange values.
/// .html         : formatted html with all the values. for other values please read the function below with all "this."

function getPanchanga(date_time, longitude, latitude) {

    this.date_time = date_time = new Date(date_time);
    var cur_date = Date.parse(date_time);  //In Milliseconds.
    this.grahas = new getGrahasEph(date_time, latitude, longitude);
    this.AscData = this.grahas.AscData;//new calculateAscendant(date_time,latitude,longitude);
    this.lagnatable = new getLagnaTable(AscData, date_time, longitude, latitude);
    var a = date_time;
    // this.grahas.grahas[7] = (this.AscData.node+360)%360; //Nodes are coming as -ve values sometime so correcting.
    // this.grahas.grahas[8] = this.AscData.Ascendant;

    // for(i=0;i<7;++i){
    //         this.grahas.grahas[i]=(360+this.grahas.grahas[i]+this.AscData.Ayanamsa)%360;
    //     }
    this.moon_cur = this.grahas.grahas[1];
    this.sun_cur = this.grahas.grahas[0];
    this.sunrise = new Date(cur_date);
    this.sunrise_next = new Date(cur_date + day);
    this.sunrise.setLocalHMS0();
    this.sunrise_next.setLocalHMS0();
    var adjust = 0; // Adjust Time Sun rise/set time if needed.
    // if(this.date_time < new Date("1 Jan 1970")) adjust=day; //This adjust is needed for days in -ve it seems
    var sr = calcSunriseGMT(dateToJul(cur_date), latitude, longitude);
    var sr2 = calcSunriseGMT(dateToJul(cur_date + day), latitude, longitude);
    this.sunrise.setMinutes(-adjust + sr - date_time.getMyTimezoneOffset());//this.sunrise.setTime(parseInt(cur_date/day)*day -adjust + sr*minutes);
    this.sunrise_next.setMinutes(-adjust + sr2 - date_time.getMyTimezoneOffset());//this.sunrise_next.setTime(parseInt(cur_date/day)*day+day -adjust+ sr2*minutes);
    this.sunset = new Date(cur_date);
    this.sunset.setLocalHMS0();
    var ss = calcSunsetGMT(dateToJul(cur_date), latitude, longitude);
    this.sunset.setMinutes(-adjust + ss - date_time.getMyTimezoneOffset());//.setTime(parseInt(cur_date/day)*day -adjust+ ss*minutes);
    this.noon = new Date(cur_date);
    this.noon.setLocalHMS0();
    this.midnight = new Date(cur_date);
    this.midnight.setLocalHMS0();
    var n = calcSolNoonGMT(dateToJul(cur_date), longitude);
    this.noon.setMinutes(-adjust + n - date_time.getMyTimezoneOffset());//.setTime(parseInt(cur_date/day)*day -adjust+ n*minutes);
    this.midnight.setMinutes(-adjust + (n + 12 * 60) - date_time.getMyTimezoneOffset());//.setTime(parseInt(cur_date/day)*day -adjust+ (n+12*60)*minutes);
    this.AscData2 = new calculateAscendant(this.sunrise, latitude, longitude);
    this.AscData3 = new calculateAscendant(this.sunrise_next, latitude, longitude);
    this.sun_begin = this.AscData2.Ascendant + 1.151008333;
    this.sun_next = this.AscData3.Ascendant + 1.151008333;
    sun_speed = (this.sun_next - this.sun_begin) / (this.sunrise_next.getTime() - this.sunrise.getTime());
    this.sun_now = this.sun_begin + sun_speed * (cur_date - this.sunrise.getTime());
    this.BhaavaTable = this.AscData.BhaavaTable;
    console.log(AscData);
    var temp = new Date(cur_date - this.sunrise % day);
    this.vara_cur = this.sunrise.getDay();
    this.vara_name = vara[this.vara_cur];
    this.vara_enter = this.sunrise;
    this.vara_exit = this.sunrise_next;
    this.MaandiDayTime = new Date();
    this.MaandiDayTime.setTime(parseInt(cur_date / day) * day + (ss - sr) * MaandiGunanka[this.vara_cur] * minutes);
    this.MaandiNightTime = new Date();
    this.MaandiNightTime.setTime(parseInt(cur_date / day) * day + ss * minutes + (24 * 60 - ss + sr2) * MaandiGunanka[(this.vara_cur + 4) % 8] * minutes);
    this.MaandiDay = new calculateAscendant(this.MaandiDayTime, latitude, longitude);
    this.MaandiNight = new calculateAscendant(this.MaandiNightTime, latitude, longitude);

    this.nakshatra_cur = this.moon_cur / nakshatra_size;
    this.nakshatra_name = nakshatra[parseInt(this.nakshatra_cur)];
    this.nakshatra_enter = new Date();
    nakshatra_enter.setTime(cur_date - (this.moon_cur % nakshatra_size) / this.grahas.speed[1]);
    this.nakshatra_exit = new Date();
    nakshatra_exit.setTime(cur_date + (nakshatra_size - this.moon_cur % nakshatra_size) / this.grahas.speed[1]);

    this.yoga_cur = (this.moon_cur + this.sun_cur) % 360 / nakshatra_size;
    this.yoga_name = yogas[parseInt(this.yoga_cur)];
    this.yoga_enter = new Date();
    yoga_enter.setTime(cur_date - ((this.moon_cur + this.sun_cur) % nakshatra_size) / (this.grahas.speed[1] + this.grahas.speed[0]));
    this.yoga_exit = new Date();
    yoga_exit.setTime(cur_date + (nakshatra_size - (this.moon_cur + this.sun_cur) % nakshatra_size) / (this.grahas.speed[1] + this.grahas.speed[0]));

    this.tithi_cur = ((360 + this.moon_cur - this.sun_cur) % 360) / 12;
    this.tithi_name = tithi[parseInt(this.tithi_cur)];
    this.tithi_enter = new Date();
    tithi_enter.setTime(cur_date - (((360 + this.moon_cur - this.sun_cur) % 360) % 12) / (this.grahas.speed[1] - this.grahas.speed[0]));
    this.tithi_exit = new Date();
    tithi_exit.setTime(cur_date + (12 - ((360 + this.moon_cur - this.sun_cur) % 360) % 12) / (this.grahas.speed[1] - this.grahas.speed[0]));

    this.karana_cur = this.tithi_cur * 2;
    this.karana_name = karana[parseInt(this.karana_cur)];
    this.karana_enter = new Date();
    karana_enter.setTime(cur_date - (((360 + this.moon_cur - this.sun_cur) % 360) % 6) / (this.grahas.speed[1] - this.grahas.speed[0]));
    this.karana_exit = new Date();
    karana_exit.setTime(cur_date + (6 - ((360 + this.moon_cur - this.sun_cur) % 360) % 6) / (this.grahas.speed[1] - this.grahas.speed[0]));

    this.kaalatable = new getKaalaTable(this.vara_cur, this.sunrise, this.sunset, latitude, longitude, cur_date);
    this.muhurthatable = new getMuhurthaTable(this.sunrise, this.sunset, parseInt(this.tithi_cur) > 14, week_days[this.vara_cur], cur_date);
    this.horatable = new getHoraTable(this.vara_cur, this.sunrise, this.sunrise_next, cur_date);

    this.iSamvatsara = ((date_time.getFullYear() - 1) + ((this.grahas.grahas[0] > 240 && date_time.getMonth() < 5) ? -7 : -6)) % 60; // -7 or -6 is correction on commonn year for getting samvatsara index ,,,after april the samvatsara starts.
    this.sSamvatsara = samvatsara[this.iSamvatsara];
    this.iSauraMaasa = parseInt(this.grahas.grahas[0] / 30);
    this.sSauraMaasa = asRashi[iSauraMaasa];

    chart[0].long = this.grahas.grahas[8];
    chart[9].long = (this.grahas.grahas[7] + 180) % 360;
    for (i = 1; i < 9; ++i) {
        chart[i].long = this.grahas.grahas[i - 1];
        chart[i].speed = this.grahas.speed[i - 1];
        chart[i].retro = this.grahas.speed[i - 1] * day > 340 ? "<b>R</b>" : "";
    }
    for (i = 0; i < 10; ++i) {
        chart[i].bhava = (parseInt(chart[i].long / 30) - parseInt(chart[0].long / 30) + 12) % 12 + 1;
    }

    // List of All Varga Divisions supported by jyotish.js
    const vargas = [
        { id: "D1", label: "Rashi (D1)", category: "Primary", meaning: "Physical/General", div: "Rashi" },
        { id: "D9", label: "Navamsha (D9)", category: "Primary", meaning: "Soul/Foundation", div: "Navamsa" },
        { id: "D10", label: "Dashamsha (D10)", category: "Primary", meaning: "Career/Success", div: "Dasamsa" },
        { id: "D12", label: "Dwadasamsa (D12)", category: "Primary", meaning: "Parents/Legacy", div: "Dwadasamsa" },
        { id: "D3", label: "Drekkanna (D3)", category: "Primary", meaning: "Siblings/Courage", div: "Dreshkana" },
        { id: "D7", label: "Saptamsha (D7)", category: "Primary", meaning: "Children/Creativity", div: "Saptamsa" },
        { id: "D30", label: "Trimshamsha (D30)", category: "Primary", meaning: "Character/Strength", div: "Trimshamsha" },

        { id: "D4", label: "Chaturtamsa (D4)", category: "Life", meaning: "Property/Happiness", div: "Chaturtamsa" },
        { id: "D16", label: "Shodashamsa (D16)", category: "Life", meaning: "Vehicles/Pleasures", div: "Shodashamsa" },
        { id: "D20", label: "Vimsamsa (D20)", category: "Life", meaning: "Spirituality/Bhakti", div: "Vimsamsa" },
        { id: "D24", label: "Chaturvimshamsa (D24)", category: "Life", meaning: "Education/Wisdom", div: "ChaturVimshamsha" },
        { id: "D27", label: "Nakshatramsa (D27)", category: "Life", meaning: "Inner Resilience", div: "Bhamsa-Nakshatramsa" },

        { id: "D40", label: "Khavedamsa (D40)", category: "Higher", meaning: "Matrilineal Merits", div: "KhaVedamsa" },
        { id: "D45", label: "Akshavedamsa (D45)", category: "Higher", meaning: "Patrilineal Merits", div: "AkshaVedamsa" },
        { id: "D60", label: "Shastiamsha (D60)", category: "Higher", meaning: "Total Karma/Roots", div: "Shastiamsha" },

        { id: "D3-Som", label: "D3-Somanatha", category: "Specialized", meaning: "Kundalini Analysis", div: "D3-Somanatha" },
        { id: "D3-Jag", label: "D3-Jagannatha", category: "Specialized", meaning: "Internal Strength", div: "D3-Jagannatha" },
        { id: "D10-Rev", label: "D10-Reverse", category: "Specialized", meaning: "Profession Nuance", div: "Dasamsa-EvenReverse" },
        { id: "D24-Rev", label: "D24-Reverse", category: "Specialized", meaning: "Vidya Deep Analysis", div: "ChaturVimshamsha-EvenReverse" }
    ];

    this.html = "";
    this.html += "<style scoped type=\"text/css\"> body{background-color:transparent !important;} </style>";
    this.html += `\n<div class="amsha-main-header" style="margin-left: 10px;">Varga Comparison Analysis</div>`;

    // 1. Fixed D1 Chart
    const d1Html = getChart(chart, "Birth (D1)", "Rashi", 5, false);

    // 2. Prepare the Switcher Logic
    let vargaRegistry = {};
    vargas.forEach(v => {
        vargaRegistry[v.id] = {
            html: getChart(chart, v.label, v.div, 5, false),
            label: v.label,
            meaning: v.meaning
        };
    });

    // Expose registry and functions globally
    window.vargaRegistry = vargaRegistry;

    window.switchVarga = function (id) {
        const data = window.vargaRegistry[id];
        if (!data) return;
        const target = document.getElementById('comparison-chart-target');
        if (target) {
            target.innerHTML = data.html;
        }
    };

    this.html += `\n<div class="varga-compare-container" style="display: flex; flex-wrap: wrap; gap: 40px; padding: 10px; margin-bottom: 30px; justify-content: center; align-items: flex-start;">
        <!-- Left: Static D1 -->
        <div class="varga-compare-column" style="flex: 1; min-width: 320px; max-width: 550px; display: flex; flex-direction: column; gap: 16px;">
            <div style="text-align: center; padding: 0 10px;">
                <div class="amsha-label" style="font-size: 1.1em; color: #a855f7; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">Birth Chart (D1)</div>
                <div style="font-size: 0.85em; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; opacity: 0.8;">Root Foundation & Physicality</div>
            </div>
            <div class="chart-card d1-static" style="background: transparent; border: none; padding: 0; text-align: center; overflow: visible;">
                 <div style="display: flex; justify-content: center; transform: scale(1.18); margin: 20px 40px;">${d1Html}</div>
            </div>
        </div>

        <!-- Right: Interactive Switcher -->
        <div class="varga-compare-column" style="flex: 1; min-width: 320px; max-width: 550px; display: flex; flex-direction: column; gap: 16px;">
             <div style="display: flex; gap: 10px; padding: 0 5px;">
                <select onchange="window.switchVarga(this.value)" style="flex: 1; padding: 12px 15px; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; color: #fff; font-weight: 700; outline: none; cursor: pointer; backdrop-filter: blur(5px);">
                    <option value="" disabled>Select Divisional Chart</option>
                    ${vargas.filter(v => v.id !== 'D1').map(v => `<option value="${v.id}" ${v.id === 'D9' ? 'selected' : ''}>${v.label}</option>`).join('')}
                </select>
             </div>
             <!-- Header removed as requested -->
             <div id="comparison-header" style="display:none;">
                <div id="comparison-label-target"></div>
                <div id="comparison-meaning-target"></div>
             </div>
             <div class="chart-card compare-dynamic" style="background: transparent; border: none; padding: 0; text-align: center; overflow: visible;">
                 <div id="comparison-chart-target" style="display: flex; justify-content: center; transform: scale(1.18); margin: 20px 40px;">${vargaRegistry['D9'].html}</div>
             </div>
        </div>
    </div>`;

    this.html += "<script>console.log('Varga Comparison Loaded');</script>";

    // Start of Structured Amsha Details
    this.html += `\n<div class="amsha-container">`;


    // 1. Vaara Card
    this.html += `\n<div class="amsha-card">
        <div class="amsha-header">
            <span class="amsha-icon">📅</span>
            <span class="amsha-label">Vaara (Day)</span>
        </div>
        <div class="amsha-value">${this.vara_name}</div>
        <div class="amsha-sub">
            <span class="amsha-badge">Sunrise: ${formatTimeSS(this.sunrise)}</span>
            <span class="amsha-badge">Sunset: ${formatTimeSS(this.sunset)}</span>
            <span class="amsha-badge">Noon: ${formatTimeSS(this.noon)}</span>
        </div>
    </div>`;

    // 2. Nakshatra Card
    this.html += `\n<div class="amsha-card">
        <div class="amsha-header">
            <span class="amsha-icon">✨</span>
            <span class="amsha-label">Nakshatra</span>
        </div>
        <div class="amsha-value">${this.nakshatra_name}</div>
        <div class="amsha-sub">
            <span class="amsha-badge">Index: ${this.nakshatra_cur.toFixed(2)}</span>
            <span class="amsha-badge">Exit: ${week_days[this.nakshatra_exit.getDay()]}-${formatTime(this.nakshatra_exit)}</span>
        </div>
    </div>`;

    // 3. Tithi Card
    this.html += `\n<div class="amsha-card">
        <div class="amsha-header">
            <span class="amsha-icon">🌙</span>
            <span class="amsha-label">Tithi</span>
        </div>
        <div class="amsha-value">${this.tithi_name}</div>
        <div class="amsha-sub">
            <span class="amsha-badge">Index: ${this.tithi_cur.toFixed(2)}</span>
            <span class="amsha-badge">Exit: ${week_days[this.tithi_exit.getDay()]}-${formatTime(this.tithi_exit)}</span>
        </div>
    </div>`;

    // 4. Karana & Yoga Card (Combined for space)
    this.html += `\n<div class="amsha-card">
        <div class="amsha-header">
            <span class="amsha-icon">⚖️</span>
            <span class="amsha-label">Karana & Yoga</span>
        </div>
        <div class="amsha-value">${this.karana_name} / ${this.yoga_name}</div>
        <div class="amsha-sub">
            <span class="amsha-badge">Karana: ${this.karana_cur.toFixed(1)}</span>
            <span class="amsha-badge">Yoga: ${this.yoga_cur.toFixed(1)}</span>
        </div>
    </div>`;

    // 5. Samvatsara & Time Card
    this.html += `\n<div class="amsha-card">
        <div class="amsha-header">
            <span class="amsha-icon">🗓️</span>
            <span class="amsha-label">Samvatsara</span>
        </div>
        <div class="amsha-value">${this.sSamvatsara} (#${this.iSamvatsara + 1})</div>
        <div class="amsha-sub">
            <span class="amsha-badge">Kali: ${date_time.getKaliAbda()}</span>
            <span class="amsha-badge">Ahargana: ${date_time.getAhargana()}</span>
        </div>
    </div>`;

    // 6. Miscellaneous Info Card
    this.html += `\n<div class="amsha-card">
        <div class="amsha-header">
            <span class="amsha-icon">💠</span>
            <span class="amsha-label">Vitals</span>
        </div>
        <div class="amsha-value">${this.sSauraMaasa} Maasa</div>
        <div class="amsha-sub">
            <span class="amsha-badge">Ayanamsha: ${toDeg(this.AscData.Ayanamsa)}</span>
            <span class="amsha-badge">Ishta Ghati: ${(((Date.parse(this.date_time) - Date.parse(this.sunrise)) / minutes) / 24).toFixed(4)}</span>
        </div>
    </div>`;

    // 7. Panchaka Card
    var panchaka = ["0-Good", "1-Mrityu Panchaka(Donate Gems)", "2-Agni Panchaka(Donate Sandal Paste)", "3-Good", "4-Raja Panchaka(Donate Lemon)", "5-Good", "6-Chora Panchaka(Donate Lamp)", "7-Good", "8-Roga Pachaka(Donate Food Grains)"];
    var p = Math.round(this.nakshatra_cur + 0.5) + (this.vara_cur + 1) + Math.round(this.tithi_cur + 0.5) + Math.round(chart[0].long / 30 + 0.5);
    this.html += `\n<div class="amsha-card" style="grid-column: 1 / -1; border-color: rgba(168, 85, 247, 0.5);">
        <div class="amsha-header">
            <span class="amsha-icon">🔮</span>
            <span class="amsha-label">Panchaka Status</span>
        </div>
        <div class="amsha-value">${panchaka[p % 9]}</div>
        <div class="amsha-sub">
            <span class="amsha-badge">Formula (Nx+Tithi+vara+lagna): ${p}</span>
        </div>
    </div>`;



    this.html += `\n</div>`; // End of amsha-container

    chart.sort(function (a, b) { return a.id - b.id; }); chart[8].long = 360 - chart[8].long;//Rahu in reverse for chara kaaraka 
    chart.sort(function (a, b) { return b.long % 30 - a.long % 30; });
    var chara_kaaraka = ["Ak", "Amk", "Bk", "Mk", "Pik", "Puk", "Gk", "Dk"];
    for (i = 0, j = 0; i < 10; ++i) {
        if (chart[i].id == 0) continue;
        if (chart[i].id == 9) continue;
        chart[i].ck = chara_kaaraka[j]; ++j;
    }
    chart.sort(function (a, b) { return a.id - b.id; }); chart[8].long = 360 - chart[8].long;//Rahu in reverse for chara kaaraka 
    //chart.sort(function(a,b){return a.long - b.long;});
    this.html = this.html + "<table style='border:1px;'><tr><th><b><small>Graha</small></b></th><th><b><small> sRasi d&deg; mm</small></b></th><th><b><small>Bhava</small></b></th><th><b><small>longitude</small></b></th><th><small>ChK</small></th></tr>";
    //chart.sort(function(a,b){return a.long - b.long;});
    for (i = 0; i < 10; ++i) {
        this.html = this.html + "<tr><td><b>" + chart[i].text + chart[i].retro + "</b></td><td>" + toSignDeg(chart[i].long) + "</td><td> (" + (chart[i].bhava) + ")</td><td>" + chart[i].long.toFixed(3) + "</td><td>" + chart[i].ck + "</td></tr>";
    }
    chart.sort(function (a, b) { return a.order - b.order; });

    this.html += "<a href=SJPdasa.htm?desc=Vimshottari%20Dasa&sphuta=" + escape(chart[2].long) + "&timezone=" + encodeURIComponent(TimeZoneOffset) +
        "&datetime=" + encodeURIComponent(this.date_time.toString()) + "&antaradasha=1&ayush=120&submit=Calculate>Moon Vimshottari Dasa</a></br>";

    this.html = this.html + "</tr></table>" +
        "\n<br/><b>Maandi Day Time & Position:</b>" + formatTimeSS(this.MaandiDayTime) + " - " + toSignDeg(this.MaandiDay.Ascendant) +
        "\n<br/><b>Maandi Night Time & Position:</b>" + formatTimeSS(this.MaandiNightTime) + " - " + toSignDeg(this.MaandiNight.Ascendant) +
        "\n<br/>" + this.lagnatable.html +
        "\n<br/><br/>" + this.kaalatable.html +
        "\n<br/>" + this.horatable.html +
        "\n<br/>" + this.muhurthatable.html +
        //                "\n<br/>"+this.BhaavaTable+
        "\n</p>";
    return this;
}

//Get and populate Geolcation co-ordinates.
function getLocation() {//Check for Geolocation and get it.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);

    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
function showPosition(position) { // Event capture for GetLocation.
    document.getElementById("longitude").value = position.coords.longitude;
    document.getElementById("latitude").value = position.coords.latitude;
    document.getElementById("timezone").value = -1 * (new Date().getTimezoneOffset() / 60);//"UnKnown";
    document.getElementById("placename").value = "BrowserLocation"
    alert("Set browser geo location");
}
function showError(error) {//Incase of error in Gelocation
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred for getCurrentPosition.");
            break;
    }
}
function calcLocalTime(d) {// function to calculate local time in a different city given the city"s UTC offset
    utc = d.getTime() + (d.getMyTimezoneOffset() * 60000);    // convert to msec , add local time zone offset , get UTC time in msec
    nd = new Date(utc + (3600000 * TimeZoneOffset));// create new Date object for different city using supplied offset
    return nd;//nd.toLocaleString();
}
function formatTime(t) { ////////////////////Formats Time in HH:MM format
    var d = calcLocalTime(t);
    var m = "" + d.getMinutes() / 100 + "0000";
    var h = "" + d.getHours() / 100 + "0000";
    return h.substr(2, 2) + ":" + m.substr(2, 2);
}
function formatDate(t) { ////////////////////Formats Time in HH:MM format
    var m = "" + (t.getMonth() + 1) / 100 + "0000";
    var d = "" + t.getDate() / 100 + "0000";
    return t.getFullYear() + "-" + m.substr(2, 2) + "-" + d.substr(2, 2);
}
function formatTimeSS(d) { return formatTime(d) + ":" + ("" + d.getSeconds() / 100 + "0000").substr(2, 2); }
function toDeg(deg) { //Show in dd*mm"ss"
    d = parseInt(deg + 1 / 1800);
    m = parseInt((deg - d) * 60);
    s = ((deg - d) * 60 - m) * 60;
    return d + "* " + m + "\" ";//+s.toFixed(0)+"\" ";
}
function toSignDeg(deg) { //Show in 0s dd*mm"ss"
    deg %= 360;
    sign = parseInt(deg / 30);
    deg %= 30;
    return sign + "s " + toDeg(deg);
}
///////////////////////////////////////////////////////////////////
//*****    This section contains the specific code required in the sunrise/sunset
//*****    calculation.
function dateToJul(date_time) {
    ///parameter in milliseconds Gets the Day count of the year
    //Returns the number of days since Jan 1 of the year.
    var d = new Date();
    d.setTime(date_time);
    d.setMonth(0);
    d.setDate(1);
    var n = date_time / day - d.getTime() / day + 1;
    //alert(date_time)
    //alert(n)
    return n;
}
function radToDeg(angleRad) {//    Convert radian angle to degrees
    return (180 * angleRad / Math.PI);
}
function degToRad(angleDeg) {//    Convert degree angle to radians
    return (Math.PI * angleDeg / 180);
}
///////////////////////////////////////////////////////////////////
//    Returns the gamma value that is used in the calculation for the equation of time
//    and the solar declination.
function calcGamma(julianDay) {
    return (2 * Math.PI / 365) * (julianDay - 1);
}
//    Returns the gamma value used to calculate eq of time
//    and solar declination.
function calcGamma2(julianDay, hour) {
    return (2 * Math.PI / 365) * (julianDay - 1 + (hour / 24));
}
//    Return the equation of time value for the given date.
function calcEqofTime(gamma) {
    //Below line was commented lets see if uncommented apr 2017
    return (229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma)));
    var epsilon = calcObliquityCorrection(t);
    var l0 = calcGeomMeanLongSun(t);
    var e = calcEccentricityEarthOrbit(t);
    var m = calcGeomMeanAnomalySun(t);

    var y = Math.tan(degToRad(epsilon) / 2.0);
    y *= y;

    var sin2l0 = Math.sin(2.0 * degToRad(l0));
    var sinm = Math.sin(degToRad(m));
    var cos2l0 = Math.cos(2.0 * degToRad(l0));
    var sin4l0 = Math.sin(4.0 * degToRad(l0));
    var sin2m = Math.sin(2.0 * degToRad(m));

    var Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0
        - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;

    return radToDeg(Etime) * 4.0;    // in minutes of time

}



// ***********************************************************************
//* Name:    calGeomMeanLongSun                         *
//* Type:    Function                                    *
//* Purpose: calculate the Geometric Mean Longitude of the Sun        *
//* Arguments:
//*   t : number of Julian centuries since J2000.0                *
//* Return value:                                        *
//*   the Geometric Mean Longitude of the Sun in degrees            *
//***********************************************************************
function calcGeomMeanLongSun(t) {
    var L0 = 280.46646 + t * (36000.76983 + 0.0003032 * t);
    while (L0 > 360.0) {
        L0 -= 360.0;
    }
    while (L0 < 0.0) {
        L0 += 360.0;
    }
    return L0;        // in degrees
}


//***********************************************************************
//* Name:    calGeomAnomalySun                            *
//* Type:    Function                                    *
//* Purpose: calculate the Geometric Mean Anomaly of the Sun        *
//* Arguments:                                        *
//*   t : number of Julian centuries since J2000.0                *
//* Return value:                                        *
//*   the Geometric Mean Anomaly of the Sun in degrees            *
//***********************************************************************
function calcGeomMeanAnomalySun(t) {
    var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
    return M;        // in degrees
}

//***********************************************************************
//* Name:    calcEccentricityEarthOrbit                        *
//* Type:    Function                                    *
//* Purpose: calculate the eccentricity of earth"s orbit            *
//* Arguments:                                        *
//*   t : number of Julian centuries since J2000.0                *
//* Return value:                                        *
//*   the unitless eccentricity                            *
//***********************************************************************
function calcEccentricityEarthOrbit(t) {
    var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    return e;        // unitless
}
//***********************************************************************
//* Name:    calcSunEqOfCenter                            *
//* Type:    Function                                    *
//* Purpose: calculate the equation of center for the sun            *
//* Arguments:                                        *
//*   t : number of Julian centuries since J2000.0                *
//* Return value:                                        *
//*   in degrees                                        *
//***********************************************************************
function calcSunEqOfCenter(t) {
    var m = calcGeomMeanAnomalySun(t);

    var mrad = degToRad(m);
    var sinm = Math.sin(mrad);
    var sin2m = Math.sin(mrad + mrad);
    var sin3m = Math.sin(mrad + mrad + mrad);

    var C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
    return C;        // in degrees
}
//***********************************************************************
//* Name:    calcSunTrueLong                                *
//* Type:    Function
//* Purpose: calculate the true longitude of the sun                *
//* Arguments:                                        *
//*   t : number of Julian centuries since J2000.0                *
//* Return value:                                        *
//*   sun"s true longitude in degrees                        *
//***********************************************************************
function calcSunTrueLong(t) {
    var l0 = calcGeomMeanLongSun(t);
    var c = calcSunEqOfCenter(t);

    var O = l0 + c;
    return O;        // in degrees
}
//***********************************************************************
//* Name:    calcSunApparentLong                            *
//* Type:    Function                                    *
//* Purpose: calculate the apparent longitude of the sun            *
//* Arguments:                                        *
//*   t : number of Julian centuries since J2000.0                *
//* Return value:                                        *
//*   sun"s apparent longitude in degrees                        *
//***********************************************************************
function calcSunApparentLong(t) {
    var o = calcSunTrueLong(t);

    var omega = 125.04 - 1934.136 * t;
    var lambda = o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
    return lambda;        // in degrees
}

//**********************************************************************
//* Name:    calcMeanObliquityOfEcliptic                        *
//* Type:    Function                                    *
//* Purpose: calculate the mean obliquity of the ecliptic            *
//* Arguments:                                        *
//*   t : number of Julian centuries since J2000.0                *
//* Return value:                                        *
//*   mean obliquity in degrees                            *
//***********************************************************************
function calcMeanObliquityOfEcliptic(t) {
    var seconds = 21.448 - t * (46.8150 + t * (0.00059 - t * (0.001813)));
    var e0 = 23.0 + (26.0 + (seconds / 60.0)) / 60.0;
    return e0;        // in degrees
}

//***********************************************************************
//* Name:    calcObliquityCorrection                        *
//* Type:    Function
//* Purpose: calculate the corrected obliquity of the ecliptic        *
//* Arguments:                                        *
//*   t : number of Julian centuries since J2000.0                *
//* Return value:                                        *
//*   corrected obliquity in degrees                        *
//***********************************************************************
function calcObliquityCorrection(t) {
    var e0 = calcMeanObliquityOfEcliptic(t);

    var omega = 125.04 - 1934.136 * t;
    var e = e0 + 0.00256 * Math.cos(degToRad(omega));
    return e;        // in degrees
}

//***********************************************************************
//* Name:    calcSunRtAscension                            *
//* Type:    Function                                    *
//* Purpose: calculate the right ascension of the sun                *
//* Arguments:                                        *
//*   t : number of Julian centuries since J2000.0                *
//* Return value:                                        *
//*   sun"s right ascension in degrees                        *
//***********************************************************************
function calcSunRtAscension(t) {
    var e = calcObliquityCorrection(t);
    var lambda = calcSunApparentLong(t);

    var tananum = (Math.cos(degToRad(e)) * Math.sin(degToRad(lambda)));
    var tanadenom = (Math.cos(degToRad(lambda)));
    var alpha = radToDeg(Math.atan2(tananum, tanadenom));
    return alpha;        // in degrees
}

//    Return the solar declination angle (in radians) for the given date.
function calcSolarDec(gamma) {
    //return (0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma));
    var e = calcObliquityCorrection(t);
    var lambda = calcSunApparentLong(t);

    var sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
    //var theta = radToDeg(Math.asin(sint));
    return Math.asin(sint);//theta;        // in degrees

}
///////////////////////////////////////////////////////////////////
//    The hour angle returned below is only for sunrise/sunset, i.e. when the solar
//    zenith angle is 90.8 degrees.
// the reason why its not 90 degrees is because we need to account for atmoshperic
// refraction.
function calcHourAngle(lat, solarDec, time) {
    var latRad = degToRad(lat);
    if (time)         //    ii true, then calculationg for sunrise
        return (Math.acos(Math.cos(degToRad(90.833)) / (Math.cos(latRad) * Math.cos(solarDec)) - Math.tan(latRad) * Math.tan(solarDec)));
    else
        return -(Math.acos(Math.cos(degToRad(90.833)) / (Math.cos(latRad) * Math.cos(solarDec)) - Math.tan(latRad) * Math.tan(solarDec)));
}
//    Return the length of the day in minutes.
function calcDayLength(hourAngle) {
    return (2 * Math.abs(radToDeg(hourAngle))) / 15;
}
function calcSunriseGMT(julDay, latitude, longitude) {
    // *** First pass to approximate sunrise
    longitude = -longitude;
    var gamma = calcGamma(julDay);
    var eqTime = calcEqofTime(gamma);
    var solarDec = calcSolarDec(gamma);
    var hourAngle = calcHourAngle(latitude, solarDec, 1);
    var delta = longitude - radToDeg(hourAngle);
    var timeDiff = 4 * delta;
    var timeGMT = 720 + timeDiff - eqTime;
    // *** Second pass includes fractional jday in gamma calc
    var gamma_sunrise = calcGamma2(julDay, timeGMT / 60);
    eqTime = calcEqofTime(gamma_sunrise);
    solarDec = calcSolarDec(gamma_sunrise);
    hourAngle = calcHourAngle(latitude, solarDec, 1);
    delta = longitude - radToDeg(hourAngle);
    timeDiff = 4 * delta;
    timeGMT = 720 + timeDiff - eqTime; // in minutes
    return timeGMT;
}
function calcRiseTime(degree, latitude, longitude) {
    console.log("calcRiseTime" + degree + "," + latitude + "," + longitude + ">" + degree / 360 * Math.PI);
    longitude = -longitude;
    var gamma = calcGamma(degree / 360 * 365.25);
    var eqTime = calcEqofTime(gamma);
    var solarDec = calcSolarDec(gamma);
    var hourAngle = calcHourAngle(latitude, solarDec, 1);
    var delta = longitude - radToDeg(hourAngle);
    var timeDiff = 4 * delta;
    var timeGMT = 720 + timeDiff - eqTime; // in minutes
    //var rise=new Date(timeGMT);
    return timeGMT;
}
function calcSolNoonGMT(julDay, longitude) {
    // Adds approximate fractional day to julday before calc gamma
    longitude = -longitude;
    var gamma_solnoon = calcGamma2(julDay, 12 + (longitude / 15));
    var eqTime = calcEqofTime(gamma_solnoon);
    var solarNoonDec = calcSolarDec(gamma_solnoon);
    var solNoonGMT = 720 + (longitude * 4) - eqTime; // min
    return solNoonGMT;
}
function calcSunsetGMT(julDay, latitude, longitude) {
    // First calculates sunrise and approx length of day
    longitude = -longitude;
    var gamma = calcGamma(julDay + 1);
    var eqTime = calcEqofTime(gamma);
    var solarDec = calcSolarDec(gamma);
    var hourAngle = calcHourAngle(latitude, solarDec, 0);
    var delta = longitude - radToDeg(hourAngle);
    var timeDiff = 4 * delta;
    var setTimeGMT = 720 + timeDiff - eqTime;
    // first pass used to include fractional day in gamma calc
    var gamma_sunset = calcGamma2(julDay, setTimeGMT / 60);
    eqTime = calcEqofTime(gamma_sunset);
    solarDec = calcSolarDec(gamma_sunset);
    hourAngle = calcHourAngle(latitude, solarDec, 0);
    delta = longitude - radToDeg(hourAngle);
    timeDiff = 4 * delta;
    setTimeGMT = 720 + timeDiff - eqTime; // in minutes
    return setTimeGMT;
}
///////////////////////////////////////////////////////////////////
/**
 * HELPER: Generates SVG string for North Indian Chart matching Overview Design
 */
function getSVGChart(chartData, centerLabel, division) {
    const theme = {
        bg: "#EFB861",
        border: "#B80000",
        textMain: "#540000"
    };

    // Devanagari mapping
    const devanagariPlanets = {
        "Su": "सू", "Mo": "चं", "Ma": "मं", "Me": "बु",
        "Ju": "गु", "Ve": "शु", "Sa": "श", "Ra": "रा", "Ke": "के", "Lg": "ल"
    };

    let ascendantSign = GetDivisionalSign(chartData[0].long, division);
    if (!ascendantSign || isNaN(ascendantSign)) ascendantSign = 1;

    const houses = {
        1: { center: { x: 200, y: 88 }, sign: { x: 200, y: 120 } },
        2: { center: { x: 97, y: 42 }, sign: { x: 130, y: 25 } },
        3: { center: { x: 58, y: 76 }, sign: { x: 40, y: 40 } },
        4: { center: { x: 100, y: 133 }, sign: { x: 160, y: 133 } },
        5: { center: { x: 58, y: 190 }, sign: { x: 40, y: 226 } },
        6: { center: { x: 97, y: 228 }, sign: { x: 130, y: 245 } },
        7: { center: { x: 200, y: 178 }, sign: { x: 200, y: 146 } },
        8: { center: { x: 304, y: 228 }, sign: { x: 270, y: 245 } },
        9: { center: { x: 341, y: 190 }, sign: { x: 360, y: 226 } },
        10: { center: { x: 300, y: 133 }, sign: { x: 240, y: 133 } },
        11: { center: { x: 341, y: 76 }, sign: { x: 360, y: 40 } },
        12: { center: { x: 304, y: 42 }, sign: { x: 270, y: 25 } },
    };

    const grouped = {};
    for (let i = 0; i < 10; i++) {
        const p = chartData[i];
        const pSign = GetDivisionalSign(p.long, division);
        let house = (pSign - ascendantSign + 1);
        if (house <= 0) house += 12;
        if (!grouped[house]) grouped[house] = [];
        grouped[house].push(p);
    }

    let svg = `<svg viewBox="0 0 400 266.6667" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto; max-width: 550px; margin: 0 auto; display: block; border-radius: 8px; overflow: hidden; background: ${theme.bg};">`;
    svg += `<rect x="0" y="0" width="400" height="266.6667" fill="${theme.bg}" stroke="${theme.border}" stroke-width="2"></rect>`;
    const paths = [
        "M 200,0 Q 200,36.3636 241.665,38.095 Q 283.33,39.8264 283.33,76.19 L 210 123.33 L 200 123.33 L 200 133.33 L 190 133.33 L 190 123.33 L 116.67 76.19 Q 116.67,39.8264 158.335,38.095 Q 200,36.3636 200,0 z",
        "M 283.33 76.19 Q 319.6936,76.19 341.665,104.76 Q 363.6364,133.33 400,133.33 Q 363.6364,133.33 341.665,162.665 Q 319.6936,192 283.33,192 L 210,143.33 L 210,133.33 L 200 133.33 L 200 123.33 L 210 123.33 z",
        "M 200,133.33 L 210,133.33 L 210,143.33 L 283.33,192 Q 283.33,228.3636 241.665,229.335 Q 200,230.3064 200,266.67 Q 200,230.3064 158.335,229.335 Q 116.67,228.3636 116.67,192 L 190,143.33 L 200,143.33 z",
        "M 200,133.33 L 200,143.33 L 190,143.33 L 116.67,192 Q 80.3064,192 58.335,162.665 Q 36.3636,133.33 0,133.33 Q 36.3636,133.33 58.335,104.76 Q 80.3064,76.19 116.67,76.19 L 190,123.33 L 190,133.33 z",
        "M 200,0 Q 200,36.3636 241.665,38.095 Q 283.33,39.8264 283.33,76.19 L 400, 0 z",
        "M 116.67,76.19 Q 116.67,39.8264 158.335,38.095 Q 200,36.3636 200,0 L 0, 0 z",
        "M 0,133.33 Q 36.3636,133.33 58.335,104.76 Q 80.3064,76.19 116.67,76.19 L 0, 0 z",
        "M 116.67,192 Q 80.3064,192 58.335,162.665 Q 36.3636,133.33 0,133.33 L 0, 266.67 z",
        "M 200,266.67 Q 200,230.3064 158.335,229.335 Q 116.67,228.3636 116.67,192 L 0, 266.67 z",
        "M 283.33,192 Q 283.33,228.3636 241.665,229.335 Q 200,230.3064 200,266.67 L 400, 266.67 z",
        "M 400,133.33 Q 363.6364,133.33 341.665,162.665 Q 319.6936,192 283.33,192 L 400, 266.67 z",
        "M 283.33,76.19 Q 319.6936,76.19 341.665,104.76 Q 363.6364,133.33 400,133.33 L 400, 0 z"
    ];
    paths.forEach(p => {
        svg += `<path fill="none" stroke="${theme.border}" d="${p}"></path>`;
    });

    svg += `<line stroke="${theme.border}" x1="190" y1="133.33" x2="210" y2="133.33"></line>`;
    svg += `<line stroke="${theme.border}" x1="200" y1="123.33" x2="200" y2="143.33"></line>`;

    for (let h = 1; h <= 12; h++) {
        let signNum = (ascendantSign + h - 1) % 12;
        if (signNum === 0) signNum = 12;
        const pos = houses[h].sign;
        svg += `<text x="${pos.x}" y="${pos.y}" font-size="13" font-family="monospace" fill="${theme.textMain}" text-anchor="middle" dominant-baseline="middle" style="font-weight: bold; opacity: 0.9;">${signNum}</text>`;
    }

    Object.keys(grouped).forEach(hKey => {
        const hNum = parseInt(hKey);
        const center = houses[hNum].center;
        const planets = grouped[hKey];

        planets.forEach((p, idx) => {
            const yOffset = (idx - (planets.length - 1) / 2) * 16;
            const retroMark = (p.retro && p.retro.indexOf("R") > -1) ? "*" : "";
            const displayName = devanagariPlanets[p.tx] || p.tx;
            const fillColor = p.tx === "Lg" ? "#000" : "#BB0000";
            svg += `<g><text x="${center.x}" y="${center.y + yOffset}" font-size="14" font-weight="normal" fill="${fillColor}" text-anchor="middle" dominant-baseline="middle" style="cursor: default; filter: drop-shadow(0px 1px 1px rgba(255,255,255,0.2));">${displayName}${retroMark}</text></g>`;
        });
    });

    svg += `</svg>`;

    return svg;
}

function getPlainChartOLD(chart, division) {
    return getSVGChart(chart, division, division);
}

function getChart(chart, center, division, size = 6, degrees = true) {
    return getSVGChart(chart, center, division);
}


function getPanchaPakshiTable(vara_cur, sunrise, sunset) {
    return this;
}
function getKaalaTable(vara_cur, sunrise, sunset, latitude, longitude, cur_time) {
    this.html = "<table border=2><tr><th>Start Time</th><th>RahuKaala Chakra</th><th>Gulika Chakra</th><th>Chaughadia Chakra</th><th>Rising degrees</th></tr>";
    var k = 0;
    var kaala = new Date();
    this.kaala_start = new MyArray(16);
    this.kaala_name = new MyArray(16);
    this.caughadia_name = new MyArray(16);
    kaala.setTime(sunrise.getTime());
    var kaalaunit = (sunset.getTime() - sunrise.getTime()) / 8;
    var i, g, c;
    for (i = 0; i < 8; ++i) {
        g = (i + kaalachakra_start[vara_cur]) % 8;
        c = (i + caughadia_start[vara_cur]) % 7;
        this.kaala_start[k] = new Date();
        this.kaala_start[k].setTime(kaala.getTime());
        this.kaala_name[k] = graha[kaalachakra[g]];
        this.caughadia_name[k] = caughadiya[c];
        if (cur_time > this.kaala_start[k])
            this.html += "<tr><td style='color:red;font-weight: bold;'>" + formatTime(this.kaala_start[k]);
        else
            this.html += "<tr><td>" + formatTime(this.kaala_start[k]);
        l = new calculateAscendant(this.kaala_start[k], latitude, longitude);
        this.html += "</td><td>" + this.kaala_name[k] + "</td>"
            + "<td id=G" + i + ">" + (i === 7 ? "--" : GulikaChakra[(vara_cur + i) % 7]) + "</td>"
            + "<td>" + this.caughadia_name[k] + "</td>"
            + "<td>" + toSignDeg(l.Ascendant) + "</td>"
            + "</tr>";
        kaala.setTime(kaala.getTime() + kaalaunit);
        ++k;
    }
    kaala.setTime(sunset.getTime());
    var kaalaunit = (24 * hours - sunset.getTime() + sunrise.getTime()) / 8;
    this.html += "<tr><td colspan=4 align=center><b>Night Time</b></td></tr>";
    for (i = 0; i < 8; ++i) {
        g = (4 + i + kaalachakra_start[vara_cur]) % 8;
        c = (5 - i * 2 + caughadia_start[vara_cur] + 21) % 7;
        this.kaala_start[k] = new Date();
        this.kaala_start[k].setTime(kaala.getTime());
        this.kaala_name[k] = graha[kaalachakra[g]];
        this.caughadia_name[k] = caughadiya[c];
        if (cur_time > this.kaala_start[k])
            this.html += "<tr><td style='color:red;font-weight: bold;'>" + formatTime(this.kaala_start[k]);
        else
            this.html += "<tr><td>" + formatTime(this.kaala_start[k]);
        l = new calculateAscendant(this.kaala_start[k], latitude, longitude);
        this.html += "</td><td>" + this.kaala_name[k] + "</td>"
            + "<td id=G" + (i + 8) + ">" + (i === 7 ? "--" : GulikaChakra[(vara_cur + i + 4) % 7]) + "</td>"
            + "<td>" + this.caughadia_name[k] + "</td>"
            + "<td>" + toSignDeg(l.Ascendant) + "</td>"
            + "</tr>";
        kaala.setTime(kaala.getTime() + kaalaunit);
        ++k;
    }

    this.html += "</table>";
    return this;
}
function getMuhurthaTable(sunrise, sunset, paksha, vaara, cur_time) {
    this.html = "<table border=2><tr><th>Muhurtha Nakshatra</th><th>Start Time</th><th>Eagle</th><th>Owl</th><th>Crow</th><th>Cock</th><th>Peacock</th></tr>";
    var k = 0;
    var m = new Date();
    this.muhurtha_start = new MyArray(30);
    this.muhurtha_name = new MyArray(30);
    m.setTime(sunrise.getTime());
    var muhurtha_unit = (sunset.getTime() - sunrise.getTime()) / 15;
    var i, g;
    for (PakshiIndex = 0; PakshiIndex < 25; ++PakshiIndex) {
        //console.log("Searching Pakshi>"+PakshiIndex + "@" +PakshiActivity[paksha*1][PakshiIndex][0]+"::"+vaara+"<"+PakshiActivity[paksha*1][PakshiIndex][0].search(vaara));
        if (PakshiActivity[paksha * 1][PakshiIndex][0].search(vaara) >= 0) break;
    };
    for (i = 0; i < 30; ++i) {
        if (i == 15) {
            m.setTime(sunset.getTime());
            muhurtha_unit = (24 * hours - sunset.getTime() + sunrise.getTime()) / 15;
            this.html += "<tr><td colspan=100% align=center><b>Night Time</b></td></tr>";
        }
        this.muhurtha_start[k] = new Date();
        this.muhurtha_start[k].setTime(m.getTime());
        this.muhurtha_name[k] = muhurtha[i];
        this.html += "<tr><td>" + this.muhurtha_name[k];
        if (cur_time > this.muhurtha_start[k])
            this.html += "</td><td style='color:red;font-weight: bold;'>" + formatTime(this.muhurtha_start[k]);
        else
            this.html += "</td><td>" + formatTime(this.muhurtha_start[k]);
        if (!(i % 3)) {
            console.log(PakshiIndex);
            this.html = this.html + "<td rowspan=3>" +
                PakshiActivity[paksha * 1][PakshiIndex][(i / 3) + 2] +
                "</td><td rowspan=3>" +
                PakshiActivity[paksha * 1][PakshiIndex + 1][(i / 3) + 2] +
                "</td><td rowspan=3>" +
                PakshiActivity[paksha * 1][PakshiIndex + 2][(i / 3) + 2] +
                "</td><td rowspan=3>" +
                PakshiActivity[paksha * 1][PakshiIndex + 3][(i / 3) + 2] +
                "</td><td rowspan=3>" +
                PakshiActivity[paksha * 1][PakshiIndex + 4][(i / 3) + 2];
        }
        this.html += "</td></tr>";
        m.setTime(m.getTime() + muhurtha_unit);

    }
    this.html += "</table>";
    return this;
}

function getHoraTable(vara_cur, sunrise, sunrise_next, cur_time) {
    this.html = "<table border=2><tr><th>Hora</th><th>Start Time</th></tr>";
    var k = 0;
    var m = new Date();
    this.hora_start = new MyArray(24);
    this.hora_name = new MyArray(24);
    m.setTime(sunrise.getTime());
    var hora_unit = (sunrise_next.getTime() - sunrise.getTime()) / 24;
    var i, g;
    for (i = 0; i < 24; ++i) {
        this.hora_start[k] = new Date();
        this.hora_start[k].setTime(m.getTime());
        this.hora_name[k] = hora[(i + order[vara_cur]) % 7];
        if (cur_time > this.hora_start[k])
            this.html += "<tr><td>" + this.hora_name[k] + "</td><td style='color:red;font-weight: bold;'>" + formatTime(this.hora_start[k]) + "</td></tr>";
        else
            this.html += "<tr><td>" + this.hora_name[k] + "</td><td>" + formatTime(this.hora_start[k]) + "</td></tr>";
        m.setTime(m.getTime() + hora_unit);
    }
    this.html += "</table>";
    return this;
}
function BinarySearch(startX, endX, findY, marginY, functionX) {
    if (Math.abs(startval - endval) <= diff) return startval;
    var mid = (startval - endval) / 2;
    if (func(startval) > tofind && tofind < func(startval + mid)) return BinarySearch(startval, mid, tofind, diff, func);
    if (func(startval + mid) < tofind && tofind < func(endval)) return BinarySearch(startval, mid, tofind, diff, func);
    return -999999999999999999999;
}

//Start Following code from http://www.astrojyoti.com/calculatoroflagna.htm

function calculateAscendant(date_time, latitude, longitude) {//Returns Ascendant Object
    //alert(date_time);
    this.date = date_time = new Date(date_time);
    // with(Math){
    var mon = date_time.getMonth() + 1;
    var day = date_time.getDate();
    var year = date_time.getFullYear();
    var hr = date_time.getHours();
    hr += date_time.getMinutes() / 60;
    var tz = date_time.getMyTimezoneOffset() / 60;
    var ln = -longitude;
    var la = latitude;
    // }
    jd = mdy2julian(mon, day, year);
    f = hr + tz;
    //if(ln < 0.0)f = hr - tz;
    //else f = hr+tz;
    t = ((jd - 2415020) + f / 24 - 0.5) / 36525;
    ayObj = new calcAyanamsa(t);
    ay = this.Ayanamsa = ayObj.ayanamsa;
    this.node = ayObj.node;

    //Right ascension (abbreviated RA; symbol α) is the angular distance measured eastward along the celestial equator from the vernal equinox to the hour circle of the point in questio
    //ra = (((6.6460656 + 2400.0513 * t + 2.58e-5 * t * t + f) * 15 - ln) % 360) * d2r; // RAMC
    ra = (((6.6460656 + 2400.0512617 * t + 2.581e-5 * t * t + f) * 15 - ln) % 360) * d2r; // RAMC
    //console.log("Calculate Ascendant t="+t);
    //Obliquity of the ecliptic is the term used by astronomers for the inclination of Earth's equator with respect to the ecliptic, or of Earth's rotation axis to a perpendicular to the ecliptic. It is about 23.4° and is currently decreasing 0.013 degrees (47 arcseconds) per hundred years due to planetary perturbations.[11] ε epsilon
    //https://en.wikipedia.org/wiki/Axial_tilt
    //T is Julian centuries from J2000.0.[17]
    ob = (23.452294 - 0.0130125 * t - 0.00000164 * t * t + 0.000000503 * t * t * t) * d2r; // Obliquity of Ecliptic
    this.ra = ra * r2d;
    this.ob = ob * r2d;
    with (Math) {
        // Calculate Midheaven
        mc = atan2(tan(ra), cos(ob));
        if (mc < 0.0) mc += PI;
        if (sin(ra) < 0.0) mc += PI;
        mc *= r2d;
        // Calculate Ascendant
        as = atan2(cos(ra), -sin(ra) * cos(ob) - tan(la * d2r) * sin(ob));
        if (as < 0.0) as += PI;
        if (cos(ra) < 0.0) as += PI;
        as *= r2d % 360.0;
    }
    // add Ayanamsa
    as = fix360(as + ay);
    mc = fix360(mc + ay);
    this.Ascendant = as;
    this.Abhijit = mc;
    // calculate bhavas as per
    // Deepak Kapoors Astronomy and Mathematical Astrology - 1997 Ranjan Pub.

    var hs = new MyArray(24);
    x = as - mc; //Difference between Asc and Mid Heaven
    if (x < 0.0) x += 360.0; //If negative make it +ve
    x /= 6; //Divide that distance in 6 parts
    y = 18; // 10th house in the MyArray
    for (i = 0; i < 7; i++) {
        hs[y] = mc + x * i;
        y++;
        if (y > 24) y = 0;
    }
    x = mc - fix360(as + 180.0);
    if (x < 0.0) x += 360.0;
    x /= 6;
    y = 12;
    for (i = 0; i < 7; i++) {
        hs[y] = fix360(as + 180 + x * i);
        y++;
    }

    for (i = 0; i < 12; i++) {
        hs[i] = fix360(hs[i + 12] + 180);
    }
    var s;
    z = 0;

    // Fill Out Madhya Values
    this.BhaavaMadya = new MyArray(12);
    this.BhaavaMadya[0] = hs[0];
    this.BhaavaMadya[1] = hs[2];
    this.BhaavaMadya[2] = hs[4];
    this.BhaavaMadya[3] = hs[6];
    this.BhaavaMadya[4] = hs[8];
    this.BhaavaMadya[5] = hs[10];
    this.BhaavaMadya[6] = hs[12];
    this.BhaavaMadya[7] = hs[14];
    this.BhaavaMadya[8] = hs[16];
    this.BhaavaMadya[9] = hs[18];
    this.BhaavaMadya[10] = hs[20];
    this.BhaavaMadya[11] = hs[22];

    // Fill Out Sandhi Values
    this.BhaavaSandhi = new MyArray(12);
    this.BhaavaSandhi[0] = hs[1];
    this.BhaavaSandhi[1] = hs[3];
    this.BhaavaSandhi[2] = hs[5];
    this.BhaavaSandhi[3] = hs[7];
    this.BhaavaSandhi[4] = hs[9];
    this.BhaavaSandhi[5] = hs[11];
    this.BhaavaSandhi[6] = hs[13];
    this.BhaavaSandhi[7] = hs[15];
    this.BhaavaSandhi[8] = hs[17];
    this.BhaavaSandhi[9] = hs[19];
    this.BhaavaSandhi[10] = hs[21];
    this.BhaavaSandhi[11] = hs[23];
    this.BhaavaTable = "<table border=2><tr><th>Bhaaava</th><th>Bhaava Madya</th><th>Bhaava Sandhi</th></tr>";
    for (i = 0; i < 12; ++i)this.BhaavaTable += "<tr><td>" + (i + 1) + "</td><td>" + toSignDeg(this.BhaavaMadya[i]) + "</td><td>" + toSignDeg(this.BhaavaSandhi[i]) + "</td></tr>";
    this.BhaavaTable += "</table>";
    return this;
}

function getRaashiMaanaUdayaTable(latitude, AscObject) {//
    this.html = "<table border=2><tr><th>Raashi</th><th>Raashi Maana-Duration</th><th>Start Time</th><th>End Time</th></tr>";

    this.html += "</table>";
    return this;
}

// Calculate the Lahiri Ayanamsa by using Erlewine Fagan-Bradley sidereal calculation
// with correction using Lahiri 1900 value in minutes (see below)
function calcAyanamsa(t) {
    ln = ((933060 - 6962911 * t + 7.5 * t * t) / 3600.0) % 360.0;  //* Mean lunar node
    Off = (259205536.0 * t + 2013816.0) / 3600.0;             //* Mean Sun
    Off = 17.23 * Math.sin(d2r * ln) + 1.27 * Math.sin(d2r * Off) - (5025.64 + 1.11 * t) * t;
    Off = (Off - 80861.27) / 3600.0;  // 84038.27 = Fagan-Bradley 80861.27 = Lahiri
    this.ayanamsa = Off;
    this.node = (ln + Off + 360) % 360;
    return this;
}

// calculate Julian Day from Month, Day and Year
//The Julian Day Number (JDN) is the integer assigned to a whole solar day in the Julian day count starting from noon Universal time, with Julian day number 0 assigned to the day starting at noon on January 1, 4713 BC, proleptic Julian calendar
//For example, the Julian Date for 00:30:00.0 UT January 1, 2013, is 2,456,293.520833.
function mdy2julian(m, d, y) {
    with (Math) {
        im = 12 * (y + 4800) + m - 3;
        j = (2 * (im - floor(im / 12) * 12) + 7 + 365 * im) / 12;
        j = floor(j) + d + floor(im / 48) - 32083;
        if (j > 2299171) j += floor(im / 4800) - floor(im / 1200) + 38;
        return j;
    }
}

// keep within 360 degrees
function fix360(v) {
    if (v < 0.0) v += 360;
    if (v > 360) v -= 360;
    return v;
}

//End Code from http://www.astrojyoti.com/calculatoroflagna.htm
function MyArray(len) {
    var i = 0;
    for (i = 1; i < len; ++i)this[i] = "";
}


////////////////////////////////////////////////////////////////////////
function setCookie(cname, cvalue, expiredays) {
    /*      var exdate=new Date();
        exdate.setDate(exdate.getDate()+expiredays);
        document.cookie=c_name+ "=" +escape(value)+((expiredays===null) ? "" : ";expires="+exdate.toGMTString());
     */
    const d = new Date();
    d.setTime(d.getTime() + (expiredays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires;//+ ";path=/";
    //return value;
}
////////////////////////////////////////////////////////////////////////
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start !== -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end === -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

function getXMLFile(f) {
    xmlHttp = GetXmlHttpObject();
    if (xmlHttp === null) {
        alert("Your browser does not support AJAX!");
        return;
    }
    var file = f;
    xmlHttp.onreadystatechange = stateChanged;
    try {
        xmlHttp.open("GET", file, false);
    } catch (err) {
        alert("GET error:" + file + ":" + err.description);
    }
    try {
        xmlHttp.send();//null
    } catch (err) {
        alert("send error:" + file + ":" + xmlHttp.status + "--" + err);
    }
}
function stateChanged() {
    if (xmlHttp.readyState === 4) {
        xml_file_opened = true;
    }
}
function GetXmlHttpObject() {
    var xmlHttp = null;
    try {
        // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    }
    catch (e) {
        // Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}

function doForm() {//Checked
    var d = new Date(params["year"], params["month"] - 1, params["day"]);
    var t = new Date("January 1, 1970 " + params["btime"]);
    TimeZoneOffset = parseFloat(params["timezone"]);//params["timezone"].split(".")[0]+"."+(params["timezone"]%1*100/60).toFixed(6).split(".")[1];// parseFloat(params["timezone"]);
    if (isNaN(TimeZoneOffset)) {
        TimeZoneOffset = -1 * d.getTimezoneOffset() / 60;
        alert("Corrected Invalid Time Zone Offset to Local Time Zone:" + params["timezone"] + " to " + TimeZoneOffset);
    }
    d.setMyTimezoneOffset(-TimeZoneOffset * 60);
    d.setDate(d.getDate());
    d.setFullYear(d.getFullYear());
    d.setMonth(d.getMonth());
    d.setHours(t.getHours());
    d.setMinutes(t.getMinutes());//-TimeZoneOffset*60);
    d.setSeconds(t.getSeconds());
    d.setMilliseconds(t.getMilliseconds());

    if (isNaN(d)) {
        alert("Invalid Date Time yyyy/mm/dd:" + params["year"] + "/" + params["month"] + "/" + params["day"] + " " + params["btime"] + "\n Using Current date time");
        d = new Date();
    }
    /*     lon = parseFloat(setCookie("latitude",params["longitude"],1000));
        lat = parseFloat(setCookie("latitude",params["latitude"],1000));
        tz = parseFloat(setCookie("timezone",params["timezone"],1000));
        c=params["placename"]; */

    lon = parseFloat(params["longitude"]);
    lat = parseFloat(params["latitude"]);
    tz = parseFloat(params["timezone"]);
    c = params["placename"];

    //   places[c]= lat+";"+lon+";"+tz;
    //   z=getCookie("placeslist");
    //   for (x in places )z=z+x+"#"+places[x]+"&";
    //    setCookie("placeslist",z,1000);
    panchanga = getPanchanga(d, lon, lat);
    // --- BEGIN: PANCHANGA AND CHART FOR Styled Section ---
    s = `\n<div class="astro-section-card astro-details-card">
      <div class="section-title"><span class="cosmos-emoji">📜</span> PANCHANGA AND CHART FOR <span class="cosmos-emoji">🌟</span></div>
      <div class="astro-details-grid">
        <div class="astro-details-label">Name:</div>
        <div class="astro-details-value highlight">${params["chartname"]}</div>
        <div class="astro-details-label">Datetime:</div>
        <div class="astro-details-value">${params["day"]}/${params["month"]}/${params["year"]} <span class="highlight">${params["btime"]}</span></div>
        <div class="astro-details-label">Timezone:</div>
        <div class="astro-details-value highlight">${params["timezone"]}</div>
        <div class="astro-details-label">Latitude, Longitude:</div>
        <div class="astro-details-value highlight">${parseFloat(params["latitude"]).toFixed(6)}, ${parseFloat(params["longitude"]).toFixed(6)}</div>
      </div>
    </div>\n` + panchanga.html;
    // --- END: PANCHANGA AND CHART FOR Styled Section ---

    // Inject theme CSS for details card if not already present
    if (!document.getElementById('astro-details-style')) {
        var style = document.createElement('style');
        style.id = 'astro-details-style';
        style.innerHTML = `
      .astro-details-card {
        background: linear-gradient(120deg, #e0f7fa 0%, #f6faf7 100%);
        border-left: 6px solid #00bcd4;
        border-radius: 16px;
        box-shadow: 0 2px 16px #00bcd444;
        padding: 28px 32px 22px 32px;
        margin: 32px 0 24px 0;
        color: #222;
        font-size: 1.13em;
      }
      .astro-details-card .section-title {
        font-size: 1.25em;
        color: #00bcd4;
        font-weight: bold;
        margin-bottom: 18px;
        display: flex;
        align-items: center;
        gap: 0.5em;
      }
      .astro-details-card .cosmos-emoji {
        font-size: 1.2em;
      }
      .astro-details-grid {
        display: grid;
        grid-template-columns: 180px 1fr;
        row-gap: 8px;
        column-gap: 12px;
        align-items: center;
      }
      .astro-details-label {
        color: #00bcd4;
        font-weight: bold;
        text-align: right;
        padding-right: 8px;
      }
      .astro-details-value {
        color: #222;
        font-weight: 500;
        text-align: left;
      }
      .astro-details-value.highlight {
        color: #bfa600;
        background: #fffbe7;
        border-radius: 6px;
        padding: 2px 8px;
        font-weight: bold;
        margin-left: 6px;
      }
      @media (max-width: 600px) {
        .astro-details-card {
          padding: 12px 6vw 12px 6vw;
          font-size: 1em;
        }
        .astro-details-grid {
          grid-template-columns: 1fr;
        }
        .astro-details-label {
          text-align: left;
          padding-right: 0;
        }
      }
      `;
        document.head.appendChild(style);
    }
    var editlink = "<a href=\"SJP.html\"><strong>Change Details</strong></a>";
    // Instead, show the KCD Dasa table by default
    var kcdTable = createTable(getKCDdasa(this.nakshatra_cur, this.date_time, true).dasa).outerHTML;
    document.write("<HTML><HEAD>"
        + "<meta http-equiv='content-type' content='text/html; charset=utf-8' />"
        + "<TITLE>" + params["chartname"] + " - Sri Jagannatha Panchanga - JavaScript</TITLE></HEAD><BODY>"
        + ""
        + editlink + s + "<br>" + kcdTable + "<br>" + editlink + "</body></html>");
    document.title = params["chartname"] + "-" + document.title;
    //    window.status="Computed Panchanga";
    document.close();
}
function setLatLong() {
    o = document.getElementById("placeslist");
    loc = o.options[o.selectedIndex].text;
    k = loc.split(/#/);
    document.getElementById("placename").value = k[0];
    k = k[1].split(/;/);
    document.getElementById("longitude").value = k[0];
    document.getElementById("latitude").value = k[1];
    document.getElementById("timezone").value = k[2];
    o.options.length = 6;//Truncate the list
    //alert("truncated list items");
    //alert("setLatLong");
}
function populatePlacesList(p) {
    amp = new RegExp(/&/);
    places_str = p.split(amp);
    o = document.getElementById("placeslist");
    for (i = 0; i < o.length; ++i)o.remove(i);
    for (x in places_str) {
        k = places_str[x].split(/#/);
        places[k[0]] = k[1];
    }
    var place;
    var ret = "";
    for (place in places) {
        var y = document.createElement("option");
        y.text = place + "#" + places[place];
        ret = ret + "&" + y.text;
        try {
            o.add(y, null);
        }
        catch (ex) {
            o.add(y);
        }
    }
    return;
}
function removePlaces() {
    o = document.getElementById("placeslist");
    var i, L = o.options.length - 1;
    for (i = L; i >= 0; i--) {
        o.remove(i);
    }
    o.options.length = 0;//Truncate the list
}
function LoadPlacesListener(e) {
    var file = PlacesInput.files[0];
    var textType = /text.+/;
    var reader = new FileReader();
    reader.onload = function (e) {
        t = reader.result;
        removePlaces();
        t = t.replace(RegExp("[\n\r]", "g"), ""); //replace new line
        places_c = places_c + "&" + t;
        populatePlacesList(places_c);
        alert("Loaded places.." + PlacesInput.files[0]);
    };
    reader.readAsText(file);
}
function LoadPlacesFile(p) {
    console.log(places_file);
    getXMLFile(places_file); //This function should open then file in background
    i = 0;
    if (xml_file_opened) { //Check if by now the file opened ,else? maybe we should add a wait
        window.status = "Parsing..." + places_file;
        var t = xmlHttp.responseText;
        t = t.replace(RegExp("[\n\r]", "g"), ""); //replace new line
        places_c = places_c + "&" + t;
        populatePlacesList(places_c);
    }
    window.status = "Wait." + i + "Status :" + xml_file_opened + "...Loading" + places_file;
    i++;
    window.status = "Loaded.." + places_file;
    return;
}

function pause(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}
function LoadFile(p) {
    xml_file_opened = false;
    if (p.length > 30) return p; //Dont Load File if the filename too large. it means the file name is the data.
    getXMLFile(p); //This function should open then file in background
    i = 0;
    do {
        getXMLFile(p);
        console.log("xmlHttp.readyState" + xmlHttp.readyState);
    } while (xmlHttp.readyState !== 4)//!xml_file_opened)
    window.status = "Loaded.." + p;
    return xmlHttp.responseText;
}


//Now using ephemeris calculations

///New getGrahasEph(date_time)
function getGrahasEph(date_time, lat, lon) {
    this.grahas = new MyArray(9);
    this.speed = new MyArray(7);
    this.body = new MyArray(9);

    tz_date = new Date(date_time);
    tz_date.setMinutes(tz_date.getMinutes() + tz_date.getMyTimezoneOffset())
    //date_time=tz_date;
    var date = {
        year: tz_date.getFullYear(),
        month: tz_date.getMonth() + 1,
        day: tz_date.getDate(),
        hours: tz_date.getHours(),
        minutes: tz_date.getMinutes(),
        seconds: tz_date.getSeconds()
    };
    var date_time2 = new Date(tz_date);
    date_time2.setDate(date_time2.getDate() + 1);
    var date2 = {
        year: date_time2.getFullYear(),
        month: date_time2.getMonth() + 1,
        day: date_time2.getDate(),
        hours: date_time2.getHours(),
        minutes: date_time2.getMinutes(),
        seconds: date_time2.getSeconds()
    };
    $const.tlong = lon; // longitude
    $const.glat = lat; // latitude
    $processor.init();


    // sun, mercury, venus, moon, mars, jupiter, saturn, uranus, neptune, pluto, chiron, sirius
    var body = $moshier.body.sun;
    $processor.calc(date, body);
    this.grahas[0] = body.position.apparentLongitude;
    this.body[0] = body;
    console.log(body.position);
    $processor.calc(date2, body);
    this.speed[0] = ((360 + body.position.apparentLongitude - this.grahas[0]) % 360) / day;

    body = $moshier.body.moon;
    $processor.calc(date, body);
    this.grahas[1] = body.position.apparentLongitude;
    this.body[1] = body;
    console.log(body.position);
    $processor.calc(date2, body);
    this.speed[1] = ((360 + body.position.apparentLongitude - this.grahas[1]) % 360) / day;

    body = $moshier.body.mars;
    $processor.calc(date, body);
    this.grahas[2] = body.position.apparentLongitude;
    this.body[2] = body;
    console.log(body.position);
    $processor.calc(date2, body);
    this.speed[2] = ((360 + body.position.apparentLongitude - this.grahas[2]) % 360) / day;

    body = $moshier.body.mercury;
    $processor.calc(date, body);
    this.grahas[3] = body.position.apparentLongitude;
    this.body[3] = body;
    $processor.calc(date2, body);
    this.speed[3] = ((360 + body.position.apparentLongitude - this.grahas[3]) % 360) / day;

    body = $moshier.body.jupiter;
    $processor.calc(date, body);
    this.grahas[4] = body.position.apparentLongitude;
    this.body[4] = body;
    console.log(body.position);
    $processor.calc(date2, body);
    this.speed[4] = ((360 + body.position.apparentLongitude - this.grahas[4]) % 360) / day;
    //debugger;

    body = $moshier.body.venus;
    $processor.calc(date, body);
    this.grahas[5] = body.position.apparentLongitude;
    this.body[5] = body;
    console.log(body.position);
    $processor.calc(date2, body);
    this.speed[5] = ((360 + body.position.apparentLongitude - this.grahas[5]) % 360) / day;

    body = $moshier.body.saturn;
    $processor.calc(date, body);
    this.grahas[6] = body.position.apparentLongitude;
    this.body[6] = body;
    console.log(body.position);
    $processor.calc(date2, body);
    this.speed[6] = ((360 + body.position.apparentLongitude - this.grahas[6]) % 360) / day;

    //this.grahas[7]=body.position.apparentLongitude;
    //console.log(body.position);

    //this.grahas[8]=body.position.apparentLongitude;

    this.AscData = new calculateAscendant(date_time, lat, lon);
    this.grahas[7] = (this.AscData.node + 360) % 360; //Nodes are coming as -ve values sometime so correcting.
    this.grahas[8] = this.AscData.Ascendant;

    for (i = 0; i < 7; ++i) {
        this.grahas[i] = (360 + this.grahas[i] + this.AscData.Ayanamsa) % 360;
    }

    //	console.log(body.position);
    //   console.log("***********Debug****************\ndate:",date,"\ndate2",date2,"\ndate_time",date_time,"\ngrahas:",this.grahas)
    //  alert("***********Debug****************\ndate:"+JSON.stringify(date)+"\ndate2"+JSON.stringify(date2)+"\ndate_time"+date_time+"\ngrahas:"+JSON.stringify(this.grahas))
}

///
var timeOut = 1000;//In milliseconds used by showtime to update time widget.
function showtime() {
    document.getElementById('date').value = (new Date()).toString();
    timerID = setTimeout("showtime()", timeOut);
}
function setParams2FormValue(formID) {
    document.getElementById(formID).value = params[formID] === undefined ? tstring : params[formID];
    console.log("setting" + formID)
}
//Initialization block
function init() {
    console.log("enter init");
    var today = new Date();

    if (document.getElementById("datetimeplace") === null) return;//Form is not present. Parameters are passed by URL.

    document.getElementById("timezone").value = params['chartname'] === undefined ? -1 * today.getTimezoneOffset() / 60 : params['timezone'];
    //Time zone needs to be set before format times
    TimeZoneOffset = parseFloat(document.getElementById("timezone").value);
    b_date = new Date();
    if (params["day"] !== undefined) b_date = new Date(params["year"], params["month"] - 2, params["day"]);
    document.getElementById("day").value = b_date.getDate();
    document.getElementById("month").value = b_date.getMonth() + 1;
    document.getElementById("year").value = b_date.getFullYear();
    console.log("enter init:initCurrentHMSDMY");
    initCurrentHMSDMY();
    var tstring = formatTimeSS(today);
    if (params["day"] !== undefined) {
        formids = ["day", "month", "year"];
        formids.forEach(setParams2FormValue);

    }
    document.getElementById("btime").value = params['btime'] === undefined ? tstring : params['btime'];
    document.getElementById("chartname").value = params['chartname'] === undefined ? "Prashna" : params['chartname'];
    document.getElementById("timezone").value = params['chartname'] === undefined ? -1 * today.getTimezoneOffset() / 60 : params['timezone'];
    document.getElementById('longitude').value = params["longitude"] === undefined ? getCookie('longitude') : params["longitude"];
    document.getElementById('latitude').value = params["latitude"] === undefined ? getCookie('latitude') : params["latitude"];
    document.getElementById('placename').value = params["placename"] === undefined ? getCookie('placename') : params["placename"];
    if (document.getElementById('longitude').value === "") document.getElementById('longitude').value = "80.2705";
    if (document.getElementById('latitude').value === "") document.getElementById('latitude').value = "13.0843";
    if (document.getElementById('placename').value === "") document.getElementById('placename').value = "Chennai";

    places_c = getCookie('placeslist');
    if (places_c === "") {
        places_c = places_const;
    }
    populatePlacesList(places_c);
    window.status = "Intialised Form";

}
function setDefaults() {
    setCookie("longitude", document.getElementById('longitude').value, 9999999);
    setCookie("latitude", document.getElementById('latitude').value, 9999999);
    setCookie("placename", document.getElementById('placename').value, 9999999);
    alert("Set Current Location as default\n" + document.cookie);
}
function JHDtz2Dec(zone) {
    tz = zone;
    if (tz[0] == "-") {
        tz = tz.replace("-", "");
    }
    else {
        tz = "-" + tz;
    }
    tz = tz.split(".")
    decMin = (parseFloat("0." + tz[1])).toPrecision(6);
    decMin = 100 * decMin;
    decTZ = tz[0] + "." + (decMin / 60).toPrecision(6).split(".")[1];
    return decTZ;
}
function ParseJHD() {
    var fileDisplayArea = document.getElementById('inputTextToSave');
    var lines = fileDisplayArea.value.replace(/\r/g, "").split("\n");
    //Line0 Date 	//L1 Month	//L2 Year	//L3 Time hh.mmss	//L4 Time zone -5.mmss	//L5 Long deg.mm	//L6 Lat deg.mm
    var time = lines[3].split(".");
    var datetime = months[lines[0] - 1] + " " + lines[1] + " " + lines[2] + " " +
        time[0] + ":" + time[1].slice(0, 2) + ":" + Math.round(time[1].slice(2, 5) * 60 / 1000);
    //document.getElementById("date").value = datetime;
    datetime = datetime.replace("\r", "");
    var d = new Date(datetime);
    if (isNaN(d.valueOf())) {
        d = new Date();
        d.setHours(time[0]);
        d.setMinutes(time[1].slice(0, 2));
        d.setSeconds(Math.round(time[1].slice(2, 5) * 60 / 1000));
    }
    document.getElementById("btime").value = formatTimeSS(d);
    document.getElementById("month").value = lines[0];
    document.getElementById("day").value = lines[1];
    document.getElementById("year").value = lines[2];
    //document.getElementById("hours").value=time[0];
    //document.getElementById("mins").value=time[1].slice(0,2);
    //document.getElementById("secs").value=Math.round(time[1].slice(2,5)*60/1000);
    tz = JHDtz2Dec(lines[4]);
    document.getElementById("timezone").value = tz;//lines[4];//*-1//tzone[0]+"."+tzone[1];
    var l = lines[5].split(".");
    document.getElementById('longitude').value = -1 * (l[0] + "." + l[1]);
    l = lines[6].split(".");
    document.getElementById('latitude').value = l[0] + "." + l[1];
    if (lines.length > 11) document.getElementById('placename').value = lines[12] + "," + lines[13];
}
function ListenToJHDloader(e) {
    var fileDisplayArea = document.getElementById('inputTextToSave');
    fileDisplayArea.value = this.result; //reader.result;
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];
    document.getElementById("chartname").value = file.name;
    ParseJHD();
}
function ListenToFileLoad(e) {
    var reader = new FileReader();
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];
    var textType = /text.+/;
    //var reader = new FileReader();
    reader.onload = ListenToJHDloader;
    reader.readAsText(file);
}
//////
function calculate() {
    document.getElementsByTagName("body")[0].innerHTML = "";
    // doForm(); // disable auto-execution which hijacks the page
    document.close();
}
//var map;
//var myCenter=new google.maps.LatLng(13.042020847922622,80.26611328125);
//Code from https://developers.google.com/maps/documentation/javascript/examples/map-simple-async
//console.log("declare placemarker");
function placeMarker(location) {
    console.log("place marker enter");

    var marker = new google.maps.Marker({
        position: location,
        map: map,
    });
    var infowindow = new google.maps.InfoWindow({
        content: 'Latitude: ' + location.lat() + '<br>Longitude: ' + location.lng()
    });
    infowindow.open(map, marker);
    document.getElementById('longitude').value = location.lng();
    document.getElementById('latitude').value = location.lat();
    document.getElementById('placename').value = "MapLocation";
    document.getElementById('timezone').value = location.lng() * 4 / 60;
}
//console.log("end declare placemarker");
//console.log("declare initialize");
function initGoogleMap() {//Called thru callback
    console.log("Entered initialize");
    //alert("Please wait a moment while loading Google maps...");
    latlong = {
        center: { lat: 13, lng: 80.135 },
        zoom: 8
    };
    m = document.getElementById("googleMap");
    console.log(m);
    console.log("entered initialize");
    map = new google.maps.Map(m, latlong);
    map.addListener('click',
        function (event) { placeMarker(event.latLng, map); }
    );
    return;
}
/*
function initialize_old() {//Called thru callback
    console.log("Entered initialize");
    //alert("Please wait a moment while loading Google maps...");
    latlong={
          center:{lat: 13, lng: 80.135},
          zoom: 0,
          scrollwheel: false,
        streetViewControl: false,
        mapTypeControl: false,
        panControl: false,
        zoomControl: true,
        draggable: false
        };
    m=document.getElementById("googleMap");
    console.log(m);
    console.log("entered initialize");
      map = new google.maps.Map(m, latlong);
      map.addListener('click',
            function(event){placeMarker(event.latLng, map);	}
        );
      return;
}
*/
function initSJP() {
    //alert("entered initSJP");
    submit = false;
    var fileInput = document.getElementById('fileInput');
    var PlacesInput = document.getElementById('PlacesInput');
    var fileDisplayArea = document.getElementById('fileDisplayArea');
    try {
        if (PlacesInput) PlacesInput.addEventListener('change', LoadPlacesListener);
        if (fileInput) fileInput.addEventListener('change', ListenToFileLoad);
    } catch (err) {
        alert(err.message + ":\nMaybe an older browser");
    }
    params = window.location.href.split("?");
    //	var fileInput = document.getElementById('fileInput');
    //	var fileDisplayArea = document.getElementById('fileDisplayArea');
    if (params[1] !== null && params[1] !== undefined) {
        params = params[1].split("&");
        for (i = 0; i < params.length; ++i) {
            var p = params[i].split("=");
            document.getElementById(p[0]).value = document.getElementById(p[0]).value.replace(/\+/g, " ");
            document.getElementById(p[0]).value = unescape(p[1]);
            p[1] = p[1].replace(/\+/g, " ");
            params[p[0]] = unescape(p[1]);
            if (p[0] === "submit" && p[1] === "Calculate") submit = true;
        }
    }
    window.status = "Set values.";
    if (submit === true) calculate();

}
console.log("sjp.js Loaded.............");

// Inject theme CSS for amsha section if not already present
if (!document.getElementById('amsha-theme-style')) {
    var style = document.createElement('style');
    style.id = 'amsha-theme-style';
    style.innerHTML = `
  .astro-section-card {
    background: linear-gradient(120deg, #e0ffe7 0%, #f6faf7 100%);
    border-left: 6px solid #2ecc40;
    border-radius: 16px;
    box-shadow: 0 2px 16px #b2dfdb44;
    padding: 28px 32px 22px 32px;
    margin: 32px 0;
    color: #222;
    font-size: 1.13em;
    transition: box-shadow 0.2s;
  }
  .astro-section-card .section-title {
    font-size: 1.35em;
    color: #219150;
    font-weight: bold;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 0.5em;
    justify-content: flex-start;
  }
  .astro-section-card .cosmos-emoji {
    font-size: 1.2em;
  }
  .amsha-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding: 10px;
    text-transform: none !important;
  }
  .amsha-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 16px;
    transition: all 0.3s ease;
  }
  .amsha-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(168, 85, 247, 0.3);
    transform: translateY(-2px);
  }
  .amsha-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 8px;
  }
  .amsha-label {
    font-weight: 800;
    color: #a855f7;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .amsha-value {
    font-size: 1.1em;
    color: #fff;
    font-weight: 600;
  }
  .amsha-sub {
    font-size: 0.85em;
    color: #94a3b8;
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .amsha-badge {
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 8px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.9em;
  }
  .amsha-main-header {
    grid-column: 1 / -1;
    color: #be85ff;
    font-size: 1.4em;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 20px 0 10px 0;
    border-bottom: 2px solid rgba(168, 85, 247, 0.3);
    padding-bottom: 8px;
  }
  @media (max-width: 600px) {
    .amsha-container {
      grid-template-columns: 1fr;
    }
  }
  `;
    document.head.appendChild(style);
}