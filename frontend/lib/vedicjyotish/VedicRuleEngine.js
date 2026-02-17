import { NakshatraAvakahada } from './constants/Avakahada';

export class VedicRuleEngine {
    /**
     * Synthesizes raw kundli results into a "Facts" object for LLM consumption.
     * @param {Object} kundliResult - Result from Kundli() function.
     * @returns {Object} Structured facts JSON.
     */
    static extractFacts(kundliResult) {
        const { planets, panchanga } = kundliResult;
        const facts = {
            ascendant: {
                sign: planets.Ascendant?.rasi?.name?.english || "Unknown",
                lord: planets.Ascendant?.rasi?.lord || "Unknown",
                degree: planets.Ascendant?.degree || 0,
                nakshatra: planets.Ascendant?.nakshatra?.name?.english || "Unknown",
                house: 1
            },
            planets: {},
            houses: {},
            panchanga: {
                tithi: panchanga?.tithi?.name?.english || "Unknown",
                vara: panchanga?.vara?.name?.english || "Unknown",
                nakshatra: panchanga?.nakshatra?.name?.english || "Unknown",
                ayanamsa: panchanga?.ayanamsa?.toFixed(4) || "0.0000"
            },
            avakahada: this.calculateAvakahada(planets.Moon)
        };

        // Extract Planet Facts for ALL available planets
        const outerPlanets = ["Uranus", "Neptune", "Pluto"];

        Object.entries(planets).forEach(([name, p]) => {
            if (name === "Ascendant" || !p.rasi || outerPlanets.includes(name)) return;

            const rasi = p.rasi;

            // Determine Dignity (Safe check)
            let dignity = "Neutral";
            if (p.exaltation === rasi.name?.english) dignity = "Exalted";
            else if (p.debilitation === rasi.name?.english) dignity = "Debilitated";
            else if (p.own_sign && p.own_sign.includes(rasi.name?.english)) dignity = "Own Sign (Swakshetra)";

            // Calculate House Aspects
            const aspectsHouses = this.calculateAspectingHouses(p);

            facts.planets[name] = {
                sign: rasi.name?.english || "Unknown",
                lord: rasi.lord || "Unknown",
                house: p.house?.num || 0,
                degree: p.degree || 0,
                nakshatra: p.nakshatra?.name?.english || "Unknown",
                dignity: dignity,
                motion: p.motion || "Margi",
                aspectingHouses: aspectsHouses
            };
        });

        // Map House Lords
        for (let i = 1; i <= 12; i++) {
            const ascRasiNum = planets.Ascendant?.rasi?.rasi_num || 1;
            const houseSign = this.getHouseSignName(i, ascRasiNum);
            const houseLord = this.getSignLord(houseSign);

            // Find which house the lord is placed in
            const lordPlanet = planets[houseLord];
            const lordPlacement = lordPlanet ? (lordPlanet.house?.num || "Unknown") : "Unknown";

            facts.houses[`House_${i}`] = {
                sign: houseSign,
                lord: houseLord,
                lordPlacement: lordPlacement,
                summary: `${houseSign} sign, ruled by ${houseLord}, with lord placed in ${lordPlacement}H.`
            };
        }

        // Detect Yogas & Doshas
        facts.yogas = this.detectYogas(planets);
        facts.doshas = this.detectDoshas(planets);

        // Add a flat planetary summary for easier LLM scanning
        facts.planetary_summary = Object.entries(facts.planets)
            .map(([name, p]) => `${name} in ${p.sign} (${p.house}H)`)
            .join(", ");

        return facts;
    }

    static detectYogas(planets) {
        const yogas = [];
        const asc = planets.Ascendant;
        const moon = planets.Moon;
        const sun = planets.Sun;
        const mercury = planets.Mercury;
        const jupiter = planets.Jupiter;
        const venus = planets.Venus;
        const mars = planets.Mars;
        const saturn = planets.Saturn;

        // 1. Gajakesari Yoga
        let gajStatus = "Not Present";
        let gajLogic = "Jupiter is not in a Kendra (1, 4, 7, 10) from the Moon.";
        let dist = 0;
        if (jupiter && moon) {
            const jHouse = jupiter.house?.num || 0;
            const mHouse = moon.house?.num || 0;
            dist = ((jHouse - mHouse + 12) % 12) + 1;
            if ([1, 4, 7, 10].includes(dist)) {
                gajStatus = "Present";
                gajLogic = `Jupiter is in a Kendra (${dist}H) from the Moon. Jupiter in ${jupiter.house.num}H, Moon in ${moon.house.num}H.`;
            }
        }
        yogas.push({
            name: "Gajakesari Yoga",
            type: "Benefic",
            status: gajStatus,
            logic: gajLogic,
            logicNp: gajStatus === "Present"
                ? `बृहस्पति चन्द्रमाबाट केन्द्र (${dist}H) मा छ। बृहस्पति ${jupiter.house.num}H मा र चन्द्रमा ${moon.house.num}H मा छ।`
                : "बृहस्पति चन्द्रमाबाट केन्द्र (१, ४, ७, १०) मा छैन।",
            description: "A royal combination involving Jupiter and Moon that brings wisdom, wealth, and lasting reputation.",
            descriptionNp: "बृहस्पति र चन्द्रमाको एक शाही संयोजन जसले ज्ञान, धन र स्थायी ख्याति ल्याउँछ।",
            effects: "Indicates abundance, strong ethics, and a life of respect and professional success.",
            effectsNp: "यसले समृद्धि, बलियो नैतिकता र सम्मानजनक व्यावसायिक सफलता प्रदान गर्दछ।"
        });

        // 2. Budha-Aditya Yoga
        let baStatus = "Not Present";
        let baLogic = "Sun and Mercury are not in the same sign or the orb is too wide (>10°).";
        let orb = 0;
        if (sun && mercury && sun.rasi?.name?.english === mercury.rasi?.name?.english) {
            orb = Math.abs(sun.degree - mercury.degree);
            if (orb < 10) {
                baStatus = "Present";
                baLogic = `Sun (${sun.degree.toFixed(1)}°) and Mercury (${mercury.degree.toFixed(1)}°) are conjunct in ${sun.rasi.name.english}. Orb: ${orb.toFixed(1)}°.`;
            }
        }
        yogas.push({
            name: "Budha-Aditya Yoga",
            type: "Intellectual",
            status: baStatus,
            logic: baLogic,
            logicNp: baStatus === "Present"
                ? `सूर्य (${sun.degree.toFixed(1)}°) र बुध (${mercury.degree.toFixed(1)}°) ${sun.rasi.name.english} मा युतिमा छन्। दुरी: ${orb.toFixed(1)}°।`
                : "सूर्य र बुध एउटै राशिमा छैनन् वा तिनीहरूबीचको दुरी १०° भन्दा बढी छ।",
            description: "The combination of Sun and Mercury indicating brilliance, sharp intelligence, and administrative skills.",
            descriptionNp: "सूर्य र बुधको संयोजन जसले तीक्ष्ण बुद्धि र प्रशासनिक क्षमतालाई संकेत गर्दछ।",
            effects: "Enhances communication, logical thinking, and potential for high academic or professional status.",
            effectsNp: "सञ्चार क्षमता, तर्कसंगत सोच र उच्च शैक्षिक वा व्यावसायिक स्तरमा सुधार ल्याउँछ।"
        });

        // 3. Lagnadhipati Raja Yoga
        let rjStatus = "Not Present";
        let rjLogic = "Ascendant lord is not in a Kendra or Trikona house.";
        const ascLord = asc?.rasi?.lord;
        const ascLordPlanet = planets[ascLord];
        let house = 0;
        if (ascLordPlanet) {
            house = ascLordPlanet.house?.num || 0;
            if ([1, 4, 7, 10, 5, 9].includes(house)) {
                rjStatus = "Present";
                rjLogic = `Lagna Lord ${ascLord} is placed in a powerful Kendra/Trikona house (${house}H). Lagna is ${asc.rasi.name.english}.`;
            }
        }
        yogas.push({
            name: "Lagnadhipati Raja Yoga",
            type: "Power",
            status: rjStatus,
            logic: rjLogic,
            logicNp: rjStatus === "Present"
                ? `लग्न स्वामी ${ascLord} बलियो केन्द्र/त्रिकोण भाव (${house}H) मा छ। लग्न ${asc.rasi.name.english} हो।`
                : "लग्न स्वामी केन्द्र वा त्रिकोण भावमा छैन।",
            description: "A powerful combination where the Ascendant lord is placed in a strength-giving house (Kendra or Trikona).",
            descriptionNp: "एक शक्तिशाली संयोग जहाँ लग्नको स्वामी बलियो भाव (केन्द्र वा त्रिकोण) मा छ।",
            effects: "Brings natural leadership, physical vitality, and the ability to overcome life's obstacles with ease.",
            effectsNp: "प्राकृतिक नेतृत्व, शारीरिक जीवन्तता र जीवनका बाधाहरू सजिलै पार गर्ने क्षमता प्रदान गर्दछ।"
        });

        // 4. Pancha Mahapurusha Yogas
        const mpYogas = [
            { p: "Mars", name: "Ruchaka Yoga", desc: "Energy, courage, and leadership.", descNp: "ऊर्जा, साहस र नेतृत्व।" },
            { p: "Mercury", name: "Bhadra Yoga", desc: "Communication, business, and intellect.", descNp: "सञ्चार, व्यापार र बुद्धि।" },
            { p: "Jupiter", name: "Hamsa Yoga", desc: "Wisdom, purity, and spiritual growth.", descNp: "ज्ञान, पवित्रता र आध्यात्मिक विकास।" },
            { p: "Venus", name: "Malavya Yoga", desc: "Luxury, arts, and relationship charm.", descNp: "विलासिता, कला र सम्बन्धको आकर्षण।" },
            { p: "Saturn", name: "Shasha Yoga", desc: "Authority, discipline, and mass leadership.", descNp: "अधिकार, अनुशासन र जननेतृत्व।" }
        ];

        mpYogas.forEach(yoga => {
            const plant = planets[yoga.p];
            if (plant) {
                const isKendra = [1, 4, 7, 10].includes(plant.house?.num);
                const isExalted = plant.exaltation === plant.rasi?.name?.english;
                const isOwn = plant.own_sign && plant.own_sign.includes(plant.rasi?.name?.english);

                if (isKendra && (isExalted || isOwn)) {
                    yogas.push({
                        name: yoga.name,
                        type: "Mahapurusha",
                        status: "Present",
                        logic: `${yoga.p} is in a Kendra (${plant.house.num}H) and is ${isExalted ? 'Exalted' : 'in its Own Sign'}.`,
                        logicNp: `${yoga.p} केन्द्र (${plant.house.num}H) मा छ र यो ${isExalted ? 'उच्च' : 'स्वगृह'} मा छ।`,
                        description: `One of the five great royal combinations. ${yoga.desc}`,
                        descriptionNp: `पाँच महान् राजयोगहरू मध्ये एक। ${yoga.descNp}`,
                        effects: "Indicates a person of heroic qualities, great achievements, and significant social impact.",
                        effectsNp: "यसले वीरतापूर्ण गुण, महान् उपलब्धि र महत्वपूर्ण सामाजिक प्रभाव भएको व्यक्तिलाई संकेत गर्दछ।"
                    });
                } else {
                    yogas.push({
                        name: yoga.name,
                        type: "Mahapurusha",
                        status: "Not Present",
                        logic: `${yoga.p} is not in a Kendra from Lagna while in its own/exaltation sign.`,
                        logicNp: `${yoga.p} आफ्नो उच्च वा स्वराशिमा भए पनि लग्नबाट केन्द्रमा छैन।`,
                        description: `A royal combination of ${yoga.p}.`,
                        descriptionNp: `${yoga.p} को एक राजयोग।`,
                        effects: yoga.desc,
                        effectsNp: yoga.descNp
                    });
                }
            }
        });

        // 5. Saraswati Yoga
        let sarStatus = "Not Present";
        let sarLogic = "Jupiter, Venus, and Mercury are not all in Kendra, Trikona, or 2nd house.";
        if (jupiter && venus && mercury) {
            const ValidHouses = [1, 4, 7, 10, 5, 9, 2];
            if (ValidHouses.includes(jupiter.house?.num) && ValidHouses.includes(venus.house?.num) && ValidHouses.includes(mercury.house?.num)) {
                sarStatus = "Present";
                sarLogic = `Jupiter (${jupiter.house.num}H), Venus (${venus.house.num}H), and Mercury (${mercury.house.num}H) are all in strengthening houses.`;
            }
        }
        yogas.push({
            name: "Saraswati Yoga",
            type: "Knowledge",
            status: sarStatus,
            logic: sarLogic,
            logicNp: sarStatus === "Present"
                ? `बृहस्पति (${jupiter.house.num}H), शुक्र (${venus.house.num}H), र बुध (${mercury.house.num}H) सबै शक्तिशाली भावहरूमा छन्।`
                : "बृहस्पति, शुक्र र बुध केन्द्र, त्रिकोण वा दोस्रो भावमा छैनन्।",
            description: "A divine combination of Jupiter, Venus, and Mercury representing the Goddess of Knowledge.",
            descriptionNp: "बृहस्पति, शुक्र र बुधको दिव्य संयोजन जसले ज्ञानकी देवी सरस्वतीलाई प्रतिनिधित्व गर्दछ।",
            effects: "Indicates exceptional talent in arts, music, writing, and various forms of higher knowledge.",
            effectsNp: "कला, संगीत, लेखन र उच्च ज्ञानका विभिन्न रूपहरूमा असाधारण प्रतिभालाई संकेत गर्दछ।"
        });

        // 6. Vipareeta Raja Yoga
        let vryStatus = "Not Present";
        let vryLogic = "Lords of 6, 8, or 12 Houses are not placed in 6, 8, or 12 Houses.";
        const trikLords = [];
        for (let i of [6, 8, 12]) {
            const sign = this.getHouseSignName(i, asc?.rasi?.rasi_num || 1);
            const lord = this.getSignLord(sign);
            const lordPlant = planets[lord];
            if (lordPlant && [6, 8, 12].includes(lordPlant.house?.num)) {
                trikLords.push(`${lord} (${i}L in ${lordPlant.house.num}H)`);
            }
        }
        if (trikLords.length > 0) {
            vryStatus = "Present";
            vryLogic = `Dusthana lords placed in Dusthana houses: ${trikLords.join(", ")}.`;
        }
        yogas.push({
            name: "Vipareeta Raja Yoga",
            type: "Success through Struggle",
            status: vryStatus,
            logic: vryLogic,
            logicNp: vryStatus === "Present"
                ? `दुस्थान (६, ८, १२) भावका स्वामीहरू दुस्थान भावमै रहेका छन्: ${trikLords.join(", ")}।`
                : "६, ८, वा १२ भावका स्वामीहरू अन्य दुस्थान भावहरूमा छैनन्।",
            description: "A unique combination where lords of difficult houses (6, 8, 12) are placed in other difficult houses.",
            descriptionNp: "एक अनौठो संयम जहाँ कठिन भावहरू (६, ८, १२) का स्वामीहरू अन्य कठिन भावहरूमा नै हुन्छन्।",
            effects: "Brings sudden gains and rise in life, often following a period of intense challenge or through the downfall of competitors.",
            effectsNp: "जीवनमा अचानक लाभ र उन्नति ल्याउँछ, प्रायः ठूला चुनौतीहरू वा प्रतिस्पर्धीहरूको पतनपछि।"
        });

        // 7. Dhana Yoga (Wealth)
        let dyStatus = "Not Present";
        let dyLogic = "No direct combination of Wealth (2nd) and Gains (11th) lords found.";

        const ascRasiNum = asc?.rasi?.rasi_num || 1;

        // Get Lords of 2nd and 11th
        const sign2 = VedicRuleEngine.getHouseSignName(2, ascRasiNum);
        const lord2 = VedicRuleEngine.getSignLord(sign2);
        const p2 = planets[lord2];

        const sign11 = VedicRuleEngine.getHouseSignName(11, ascRasiNum);
        const lord11 = VedicRuleEngine.getSignLord(sign11);
        const p11 = planets[lord11];

        // Check 1: Conjunction (Same Sign)
        if (p2 && p11 && p2.rasi?.name?.english === p11.rasi?.name?.english) {
            dyStatus = "Present";
            dyLogic = `Lord of 2nd (${lord2}) and Lord of 11th (${lord11}) are conjunct in ${p2.rasi.name.english}.`;
        }
        // Check 2: Parivartana (Exchange) or Occupancy
        else if (p2 && p11) {
            const p2House = p2.house?.num;
            const p11House = p11.house?.num;

            if (p2House === 11 && p11House === 2) {
                dyStatus = "Present";
                dyLogic = `Parivartana Yoga: Lord of 2nd is in 11th, and Lord of 11th is in 2nd.`;
            } else if (p2House === 11) {
                dyStatus = "Present";
                dyLogic = `Lord of Wealth (2nd, ${lord2}) is placed in the House of Gains (11th).`;
            } else if (p11House === 2) {
                dyStatus = "Present";
                dyLogic = `Lord of Gains (11th, ${lord11}) is placed in the House of Wealth (2nd).`;
            }
        }

        yogas.push({
            name: "Dhana Yoga",
            type: "Wealth",
            status: dyStatus,
            logic: dyLogic,
            logicNp: dyStatus === "Present"
                ? dyLogic.replace('Lord', 'स्वामी').replace('Wealth', 'धन').replace('Gains', 'लाभ').replace('conjunct', 'युति').replace('placed', 'अवस्थित')
                : "धन (२) र लाभ (११) भावका स्वामीहरू बीच कुनै विशेष सम्बन्ध फेला परेन।",
            description: "A planetary combination that creates wealth, financial stability, and material abundance.",
            descriptionNp: "ग्रहहरूको एक संयोजन जसले धन, आर्थिक स्थिरता र भौतिक समृद्धि सिर्जना गर्दछ।",
            effects: "Indicates multiple sources of income and good financial accumulation capabilities.",
            effectsNp: "आयका धेरै स्रोतहरू र राम्रो आर्थिक संचय क्षमताहरूलाई संकेत गर्दछ।"
        });

        return yogas;
    }

    static detectDoshas(planets) {
        const doshas = [];
        const mars = planets.Mars;
        const rahu = planets.Rahu;
        const ketu = planets.Ketu;

        // 1. Manglik Dosha
        let mStatus = "Not Present";
        let mLogic = "Mars is not in houses 1, 4, 7, 8, or 12.";
        let mHouse = 0;
        if (mars) {
            mHouse = mars.house?.num || 0;
            if ([1, 4, 7, 8, 12].includes(mHouse)) {
                const isExalted = mars.exaltation === mars.rasi?.name?.english;
                const isOwn = mars.own_sign && mars.own_sign.includes(mars.rasi?.name?.english);

                if (isExalted || isOwn) {
                    mLogic = `Mars is in ${mHouse}H but cancelled/neutralized due to being ${isExalted ? 'Exalted' : 'in its Own Sign'}.`;
                } else {
                    mStatus = "Present";
                    mLogic = `Mars is placed in the ${mHouse}H (${mars.rasi.name.english}) with no major cancellations.`;
                }
            }
        }
        doshas.push({
            name: "Manglik Dosha",
            status: mStatus,
            logic: mLogic,
            logicNp: mStatus === "Present"
                ? `मंगल ${mHouse}H (${mars.rasi.name.english}) मा कुनै प्रमुख रद्द बिना नै अवस्थित छ।`
                : (mars && (mars.exaltation === mars.rasi?.name?.english || (mars.own_sign && mars.own_sign.includes(mars.rasi?.name?.english)))
                    ? `मंगल ${mars.house.num}H मा छ तर ${mars.exaltation === mars.rasi?.name?.english ? 'उच्च' : 'स्वगृह'} भएकाले यो दोष निष्क्रिय वा प्रभावित छ।`
                    : "मंगल १, ४, ७, ८ वा १२ भावमा छैन।"),
            description: "An affliction caused by Mars which can impact interpersonal relationships and marital harmony.",
            descriptionNp: "विषेशगरी दाम्पत्य जीवन र आपसी सम्बन्धमा प्रभाव पार्ने मंगल ग्रहको एक दोष।",
            effects: "May lead to delays in marriage or intense relationship dynamics; often neutralized by age or compatible matching.",
            effectsNp: "विवाहमा ढिलाइ वा सम्बन्धमा तनाव ल्याउन सक्छ; उमेर वा मिल्दो कुण्डलीसँगको विवाहले यसलाई शान्त पार्छ।",
            remedies: mStatus === "Present" ? ["Mangal Shanti", "Kumbh Vivah", "Hanuman Chalisa"] : [],
            remediesNp: mStatus === "Present" ? ["मंगल शान्ति पूजा", "कुम्भ विवाह", "हनुमान चालिसा पाठ"] : []
        });

        // 2. Kaal Sarp Dosha
        let ksStatus = "Not Present";
        let ksLogic = "All planets are not within the Rahu-Ketu axis.";
        let rahuTotal = 0;
        let ketuTotal = 0;
        if (rahu && ketu) {
            rahuTotal = rahu.degree;
            ketuTotal = ketu.degree;
            let min = Math.min(rahuTotal, ketuTotal);
            let max = Math.max(rahuTotal, ketuTotal);

            const corePlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
            let inside = 0;
            corePlanets.forEach(name => {
                const p = planets[name];
                if (!p) return;
                const pDeg = p.degree;
                if (pDeg > min && pDeg < max) inside++;
            });

            if (inside === corePlanets.length || inside === 0) {
                ksStatus = "Present";
                ksLogic = `All 7 core planets are hemmed on one side of the Rahu (${rahuTotal.toFixed(1)}°) - Ketu (${ketuTotal.toFixed(1)}°) axis.`;
            }
        }
        doshas.push({
            name: "Kaal Sarp Dosha",
            status: ksStatus,
            logic: ksLogic,
            logicNp: ksStatus === "Present"
                ? `सबै ७ मुख्य ग्रहहरू राहु (${rahuTotal.toFixed(1)}°) र केतु (${ketuTotal.toFixed(1)}°) को अक्षभित्र बाँधिएका छन्।`
                : "सबै ग्रहहरू राहु-केतु अक्षभित्र मात्र छैनन्।",
            description: "A significant placement where all major planets are hemmed between Rahu and Ketu.",
            descriptionNp: "एक विशेष स्थिति जहाँ सबै मुख्य ग्रहहरू राहु र केतुको बीचमा बाँधिएका हुन्छन्।",
            effects: "Can indicate a life of struggle and sudden changes, but also potential for great fame and spiritual depth.",
            effectsNp: "यसले संघर्ष र अचानक परिवर्तनहरूलाई संकेत गर्दछ, तर ठूलो ख्याति र आध्यात्मिक गहिराइको सम्भावना पनि रहन्छ।",
            remedies: ksStatus === "Present" ? ["Maha Mrityunjaya", "Shiva Puja"] : [],
            remediesNp: ksStatus === "Present" ? ["महामृत्युञ्जय जाप", "शिव पूजा"] : []
        });

        // 3. Shrapit Dosha (Saturn + Rahu)
        let sStatus = "Not Present";
        let sLogic = "Saturn and Rahu are not conjunct.";
        if (planets.Saturn && planets.Rahu && planets.Saturn.rasi?.name?.english === planets.Rahu.rasi?.name?.english) {
            sStatus = "Present";
            sLogic = `Saturn and Rahu are conjunct in ${planets.Saturn.rasi.name.english}, creating Shrapit (Cursed) Dosha.`;
        }
        doshas.push({
            name: "Shrapit Dosha",
            status: sStatus,
            logic: sLogic,
            logicNp: sStatus === "Present"
                ? `शनि र राहु ${planets.Saturn.rasi.name.english} मा युतिमा छन्, जसले श्रापित दोष सिर्जना गर्दछ।`
                : "शनि र राहुको युति छैन।",
            description: "Formed by Saturn and Rahu conjunction, bringing struggles and misfortune.",
            descriptionNp: "शनि र राहुको युतिद्वारा निर्मित, जसले संघर्ष र दुर्भाग्य ल्याउँछ।",
            effects: "Indicates deep hurdles and the need for persistent effort to achieve stability.",
            effectsNp: "जीवनमा गहिरा बाधाहरू र स्थिरता प्राप्त गर्न निरन्तर प्रयासको आवश्यकतालाई संकेत गर्दछ।",
            remedies: sStatus === "Present" ? ["Shani Shanti", "Rahu Mantra", "Service to elderly"] : [],
            remediesNp: sStatus === "Present" ? ["शनि शान्ति पूजा", "राहु मन्त्र", "वृद्धवृद्धाको सेवा"] : []
        });

        // 4. Grahan Dosha (Sun/Moon + Rahu/Ketu)
        let gStatus = "Not Present";
        let gLogic = "No eclipse-like conjunctions detected for Sun or Moon.";
        const gReasons = [];
        const sun = planets.Sun;
        const moon = planets.Moon;
        if (sun && rahu && sun.rasi?.name?.english === rahu.rasi?.name?.english && Math.abs(sun.degree - rahu.degree) < 10) gReasons.push("Sun-Rahu");
        if (sun && ketu && sun.rasi?.name?.english === ketu.rasi?.name?.english && Math.abs(sun.degree - ketu.degree) < 10) gReasons.push("Sun-Ketu");
        if (moon && rahu && moon.rasi?.name?.english === rahu.rasi?.name?.english && Math.abs(moon.degree - rahu.degree) < 10) gReasons.push("Moon-Rahu");
        if (moon && ketu && moon.rasi?.name?.english === ketu.rasi?.name?.english && Math.abs(moon.degree - ketu.degree) < 10) gReasons.push("Moon-Ketu");

        if (gReasons.length > 0) {
            gStatus = "Present";
            gLogic = `Grahan Dosha detected: ${gReasons.join(", ")} conjunction(s).`;
        }
        doshas.push({
            name: "Grahan Dosha",
            status: gStatus,
            logic: gLogic,
            logicNp: gStatus === "Present"
                ? `ग्रहण दोष फेला पर्यो: ${gReasons.join(", ")} युति(हरू)।`
                : "सूर्य वा चन्द्रमाको ग्रहण जस्तो कुनै युति फेला परेन।",
            description: "Occurs when Sun or Moon is conjunct Rahu or Ketu (eclipse effect).",
            descriptionNp: "सूर्य वा चन्द्रमा राहु वा केतुसँग युतिमा हुँदा (ग्रहण प्रभाव) यो दोष उत्पन्न हुन्छ।",
            effects: "Can impact mental peace (Moon) or vitality and authorty (Sun).",
            effectsNp: "यसले मानसिक शान्ति (चन्द्रमा) वा जीवनशक्ति र अधिकार (सूर्य) मा प्रभाव पार्न सक्छ।",
            remedies: gStatus === "Present" ? ["Aditya Hridaya Stotra", "Shiva Puja", "Charity"] : [],
            remediesNp: gStatus === "Present" ? ["आदित्य हृदय स्तोत्र", "शिव पूजा", "दान-पुण्य"] : []
        });

        // 5. Pitra Dosha
        let pStatus = "Not Present";
        let pLogic = "No major Pitra Dosha indicators found in the 9th house.";
        const pReasons = [];
        if (rahu && rahu.house?.num === 9) pReasons.push("Rahu in 9H");
        if (planets.Saturn && planets.Saturn.house?.num === 9) pReasons.push("Saturn in 9H");
        if (sun && planets.Saturn && sun.house?.num === 9 && planets.Saturn.house?.num === 9) pReasons.push("Sun-Saturn in 9H");

        if (pReasons.length > 0) {
            pStatus = "Present";
            pLogic = `Indicator(s) found: ${pReasons.join(", ")}.`;
        }
        doshas.push({
            name: "Pitra Dosha",
            status: pStatus,
            logic: pLogic,
            logicNp: pStatus === "Present"
                ? `संकेत(हरू) फेला परे: ${pReasons.join(", ")}।`
                : "९औं भावमा कुनै महत्वपूर्ण पितृ दोष सूचकहरू फेला परेनन्।",
            description: "Linked to ancestral karma, affecting family and overall progress.",
            descriptionNp: "पुर्खाहरूको कर्मसँग सम्बन्धित, जसले परिवार र समग्र प्रगतिको प्रभाव पार्दछ।",
            effects: "May bring obstacles in progeny, family disputes, or career delays.",
            effectsNp: "सन्तति प्राप्तिको बाधा, पारिवारिक विवाद वा करियरमा ढिलाइ ल्याउन सक्छ।",
            remedies: pStatus === "Present" ? ["Pitra Tarpan", "Serving Cow", "Gayatri Mantra"] : [],
            remediesNp: pStatus === "Present" ? ["पितृ तर्पण", "गौ सेवा", "गायत्री मन्त्र"] : []
        });

        // 6. Nadi (Individual Zodiac Constitution)
        // Authoritative mapping as per Drik Panchang / Traditional Texts
        // Updated keys to match both standard and library (Kundli.ts) spellings
        const nadiData = {
            "Ashwini": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Aswini": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Ardra": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Punarvasu": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Uttara Phalguni": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "UttaraPhalguni": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Hasta": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Jyeshtha": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Moola": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Mula": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Shatabhisha": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Purva Bhadrapada": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "Purva Bhadra": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },
            "PurvaBhadra": { name: "Adi", nature: "Vata", meaning: "Beginning / Constitution" },

            "Bharani": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Mrigashirsha": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Mrigashira": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Pushya": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Purva Phalguni": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "PurvaPhalguni": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Chitra": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Anuradha": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Purva Ashadha": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "PurvaShadha": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Dhanishta": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Uttara Bhadrapada": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "Uttara Bhadra": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },
            "UttaraBhadra": { name: "Madhya", nature: "Pitta", meaning: "Balance / Metabolism" },

            "Krittika": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "Rohini": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "Ashlesha": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "Magha": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "Swati": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "Vishakha": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "Uttara Ashadha": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "UttaraShadha": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "Shravana": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "Sravana": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" },
            "Revati": { name: "Antya", nature: "Kapha", meaning: "Stability / Reproduction" }
        };

        const nakName = moon?.nakshatra?.name?.english || "Unknown";
        // Normalize: handle cases like "Purva Bhadra" vs "PurvaBhadra" by trying both literal and spaceless
        const profile = nadiData[nakName] || nadiData[nakName.replace(/\s/g, '')];

        doshas.push({
            name: "Nadi Dosha",
            status: profile ? "Present" : "Not Present",
            logic: profile
                ? `Birth Nadi identified as ${profile.name} (${profile.nature}) based on Moon in ${nakName}.`
                : `Nadi could not be determined (Nakshatra: ${nakName}).`,
            logicNp: profile
                ? `चन्द्रमा ${nakName} नक्षत्रमा भएकाले जन्म नाडी ${profile.name} (${profile.nature}) को रूपमा पहिचान गरिएको छ।`
                : `नाडी निर्धारण गर्न सकिएन (${nakName} नक्षत्र)।`,
            description: `Authoritative Basis: Nadi is strictly Moon-Nakshatra based. Your Nadi nature is ${profile?.nature || "Unknown"} (${profile?.meaning || ""}).`,
            descriptionNp: `नाडी निर्धारण पूर्णतया चन्द्र-नक्षत्रमा आधारित हुन्छ। तपाईंको नाडी प्रकृति ${profile?.nature || "अज्ञात"} (${profile?.meaning || ""}) हो।`,
            effects: profile
                ? `Nadi Dosha risk identified: This Dosha becomes active only if matching with a partner of the same ${profile.name} Nadi (0/8 Guna points). Matching with different Nadis ensures 8/8 points.`
                : "Match with different Nadis for optimal marital harmony.",
            effectsNp: profile
                ? `नाडी दोष जोखिम पहिचान: यदि समान ${profile.name} नाडी भएको साथीसँग विवाह गरेमा मात्र यो दोष सक्रिय हुन्छ (गुण मिलानमा ०/८ अंक)। फरक नाडी भएका साथीसँग विवाह गर्दा उत्तम हुन्छ (८/८ अंक)।`
                : "उत्तम दाम्पत्य जीवनको लागि फरक नाडी भएको साथीसँग जोडी मिलाउनुहोस्।",
            remedies: ["Nadi matching before marriage", "Maha Mrityunjaya Puja for existing Dosha"],
            remediesNp: ["विवाहपूर्व नाडी मिलान", "विद्यमान नाडी दोषको लागि महामृत्युञ्जय पूजा"]
        });

        return doshas;
    }

    /**
     * Calculates which houses a planet aspects based on its position and Vedic rules.
     */
    static calculateAspectingHouses(planet) {
        if (!planet.aspect) return [7]; // Default aspect for all planets is 7th

        const currentHouse = planet.house?.num || 0;
        if (currentHouse === 0) return [7];

        return planet.aspect.map(dist => {
            let target = currentHouse + dist - 1;
            if (target > 12) target -= 12;
            if (target <= 0) target += 12;
            return target;
        });
    }

    static getHouseSignName(houseNum, ascRasiNum) {
        const signNum = ((ascRasiNum + houseNum - 2) % 12) + 1;
        const signMap = {
            1: "Aries", 2: "Taurus", 3: "Gemini", 4: "Cancer", 5: "Leo", 6: "Virgo",
            7: "Libra", 8: "Scorpio", 9: "Sagittarius", 10: "Capricorn", 11: "Aquarius", 12: "Pisces"
        };
        return signMap[signNum];
    }

    static getSignLord(signName) {
        const lordMap = {
            "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
            "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
            "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
        };
        return lordMap[signName];
    }

    static calculateAvakahada(moonPlanet) {
        if (!moonPlanet || !moonPlanet.nakshatra) return null;

        const nakName = moonPlanet.nakshatra.name.english;
        const deg = moonPlanet.degree;
        const degPerNak = 360 / 27; // 13.3333
        const degInNak = deg % degPerNak;
        const pada = Math.floor(degInNak / (degPerNak / 4)) + 1;

        let safeNakName = nakName ? nakName.trim() : "";

        // Comprehensive aliases for Swiss Ephemeris vs Avakahada lookup
        const aliases = {
            "Purva Bhadra": "Purva Bhadrapada",
            "Uttara Bhadra": "Uttara Bhadrapada",
            "Purva Asadha": "Purva Ashadha",
            "Uttara Asadha": "Uttara Ashadha",
            "Sravana": "Shravana",
            "Mula": "Moola",
            "Mrigasira": "Mrigashirsha",
            "Kritika": "Krittika",
            "Punarvasu": "Punarvasu",
            "Aslesha": "Ashlesha",
            "Magha": "Magha",
            "Satabhisha": "Shatabhisha",
            "Dhanistha": "Dhanishta"
        };

        if (aliases[safeNakName]) {
            safeNakName = aliases[safeNakName];
        }

        // Try direct match, then alias, then stripped-space match
        let details = NakshatraAvakahada[safeNakName];

        if (!details) {
            // Ultra-robust normalization fallback
            const keys = Object.keys(NakshatraAvakahada);
            const normalizedInput = safeNakName.toLowerCase().replace(/\s+/g, '');
            const matchingKey = keys.find(k => k.toLowerCase().replace(/\s+/g, '') === normalizedInput);
            if (matchingKey) {
                details = NakshatraAvakahada[matchingKey];
            }
        }

        if (!details) return null;

        const detailIdx = Math.max(0, Math.min(3, pada - 1));

        return {
            rasi: moonPlanet.rasi.name.english,
            nakshatra: nakName,
            pada: pada,
            gana: details.gana,
            nadi: details.nadi,
            yoni: details.yoni,
            varna: details.varna,
            vashya: details.vashya,
            word: details.letters[detailIdx]
        };
    }
}
