export type Gana = "Deva" | "Manushya" | "Rakshasa";
export type Nadi = "Adi" | "Madhya" | "Antya";
export type Varna = "Brahmin" | "Kshatriya" | "Vaishya" | "Shudra";
export type Vashya = "Chatushpada" | "Manava" | "Jalachara" | "Vanachara" | "Keeta";
export type Yoni =
    | "Horse"
    | "Elephant"
    | "Sheep"
    | "Serpent"
    | "Dog"
    | "Cat"
    | "Rat"
    | "Cow"
    | "Buffalo"
    | "Tiger"
    | "Deer"
    | "Monkey"
    | "Lion"
    | "Mongoose";

export interface AvakahadaDetail {
    gana: Gana;
    nadi: Nadi;
    yoni: Yoni;
    varna: Varna;
    vashya: Vashya;
    letters: [string, string, string, string]; // Padas 1, 2, 3, 4
}

export const NakshatraAvakahada: Record<string, AvakahadaDetail> = {
    Ashwini: {
        gana: "Deva",
        nadi: "Adi",
        yoni: "Horse",
        varna: "Vaishya",
        vashya: "Chatushpada",
        letters: ["Chū", "Che", "Cho", "Lā"],
    },
    Bharani: {
        gana: "Manushya",
        nadi: "Madhya",
        yoni: "Elephant",
        varna: "Shudra",
        vashya: "Chatushpada",
        letters: ["Lī", "Lū", "Le", "Lo"],
    },
    Krittika: {
        gana: "Rakshasa",
        nadi: "Antya",
        yoni: "Sheep",
        varna: "Vaishya",
        vashya: "Chatushpada",
        letters: ["A", "Ī", "Ū", "E"],
    },
    Rohini: {
        gana: "Manushya",
        nadi: "Antya",
        yoni: "Serpent",
        varna: "Shudra",
        vashya: "Chatushpada",
        letters: ["O", "Vā", "Vī", "Vū"],
    },
    Mrigashirsha: {
        gana: "Deva",
        nadi: "Madhya",
        yoni: "Serpent",
        varna: "Vaishya",
        vashya: "Chatushpada",
        letters: ["Ve", "Vo", "Kā", "Kī"],
    },
    Ardra: {
        gana: "Manushya",
        nadi: "Adi",
        yoni: "Dog",
        varna: "Shudra",
        vashya: "Manava",
        letters: ["Ku", "Gha", "Ṅa", "Chha"],
    },
    Punarvasu: {
        gana: "Deva",
        nadi: "Adi",
        yoni: "Cat",
        varna: "Vaishya",
        vashya: "Manava",
        letters: ["Ke", "Ko", "Hā", "Hī"],
    },
    Pushya: {
        gana: "Deva",
        nadi: "Madhya",
        yoni: "Sheep",
        varna: "Kshatriya",
        vashya: "Manava",
        letters: ["Hu", "He", "Ho", "Ḍā"],
    },
    Ashlesha: {
        gana: "Rakshasa",
        nadi: "Antya",
        yoni: "Cat",
        varna: "Shudra",
        vashya: "Keeta",
        letters: ["Ḍī", "Ḍū", "Ḍe", "Ḍo"],
    },
    Magha: {
        gana: "Rakshasa",
        nadi: "Adi",
        yoni: "Rat",
        varna: "Shudra",
        vashya: "Chatushpada",
        letters: ["Mā", "Mī", "Mū", "Me"],
    },
    "Purva Phalguni": {
        gana: "Manushya",
        nadi: "Madhya",
        yoni: "Rat",
        varna: "Brahmin",
        vashya: "Chatushpada",
        letters: ["Mo", "Tā", "Tī", "Tū"],
    },
    "Uttara Phalguni": {
        gana: "Manushya",
        nadi: "Adi",
        yoni: "Cow",
        varna: "Kshatriya",
        vashya: "Chatushpada",
        letters: ["Te", "To", "Pā", "Pī"],
    },
    Hasta: {
        gana: "Deva",
        nadi: "Adi",
        yoni: "Buffalo",
        varna: "Vaishya",
        vashya: "Manava",
        letters: ["Pū", "Sha", "Ṇa", "Ṭha"],
    },
    Chitra: {
        gana: "Rakshasa",
        nadi: "Madhya",
        yoni: "Tiger",
        varna: "Shudra",
        vashya: "Keeta",
        letters: ["Pe", "Po", "Rā", "Rī"],
    },
    Swati: {
        gana: "Deva",
        nadi: "Antya",
        yoni: "Buffalo",
        varna: "Vaishya",
        vashya: "Manava",
        letters: ["Rū", "Re", "Ro", "Tā"],
    },
    Vishakha: {
        gana: "Rakshasa",
        nadi: "Antya",
        yoni: "Tiger",
        varna: "Shudra",
        vashya: "Manava",
        letters: ["Tī", "Tū", "Te", "To"],
    },
    Anuradha: {
        gana: "Deva",
        nadi: "Madhya",
        yoni: "Deer",
        varna: "Shudra",
        vashya: "Keeta",
        letters: ["Nā", "Nī", "Nū", "Ne"],
    },
    Jyeshtha: {
        gana: "Rakshasa",
        nadi: "Adi",
        yoni: "Deer",
        varna: "Shudra",
        vashya: "Keeta",
        letters: ["No", "Yā", "Yī", "Yū"],
    },
    Moola: {
        gana: "Rakshasa",
        nadi: "Adi",
        yoni: "Dog",
        varna: "Shudra",
        vashya: "Chatushpada",
        letters: ["Ye", "Yo", "Bā", "Bī"],
    },
    "Purva Ashadha": {
        gana: "Manushya",
        nadi: "Madhya",
        yoni: "Monkey",
        varna: "Kshatriya",
        vashya: "Chatushpada",
        letters: ["Bū", "Dha", "Pha", "Ḍha"],
    },
    "Uttara Ashadha": {
        gana: "Manushya",
        nadi: "Antya",
        yoni: "Mongoose",
        varna: "Vaishya",
        vashya: "Chatushpada",
        letters: ["Be", "Bo", "Jā", "Jī"],
    },
    Shravana: {
        gana: "Deva",
        nadi: "Antya",
        yoni: "Monkey",
        varna: "Vaishya",
        vashya: "Manava",
        letters: ["Khi", "Khu", "Khe", "Kho"],
    },
    Dhanishta: {
        gana: "Rakshasa",
        nadi: "Madhya",
        yoni: "Lion",
        varna: "Shudra",
        vashya: "Manava",
        letters: ["Ga", "Gi", "Gu", "Ge"],
    },
    Shatabhisha: {
        gana: "Rakshasa",
        nadi: "Adi",
        yoni: "Horse",
        varna: "Shudra",
        vashya: "Manava",
        letters: ["Go", "Sā", "Sī", "Sū"],
    },
    "Purva Bhadrapada": {
        gana: "Manushya",
        nadi: "Adi",
        yoni: "Lion",
        varna: "Brahmin",
        vashya: "Manava",
        letters: ["Se", "So", "Dā", "Dī"],
    },
    "Uttara Bhadrapada": {
        gana: "Manushya",
        nadi: "Madhya",
        yoni: "Cow",
        varna: "Kshatriya",
        vashya: "Chatushpada",
        letters: ["Dū", "Tha", "Jha", "Ña"],
    },
    Revati: {
        gana: "Deva",
        nadi: "Antya",
        yoni: "Elephant",
        varna: "Shudra",
        vashya: "Jalachara",
        letters: ["De", "Do", "Chā", "Chī"],
    },
};
