export const MEDICAL_GLOSSARY: Record<string, string> = {
    // Lipids
    "Total Cholesterol": "A measure of the total amount of cholesterol in your blood. High levels can increase the risk of heart disease.",
    "LDL Cholesterol": "Low-Density Lipoprotein, often called 'bad' cholesterol. High levels lead to plaque buildup in arteries.",
    "HDL Cholesterol": "High-Density Lipoprotein, often called 'good' cholesterol. It helps remove other forms of cholesterol from your bloodstream.",
    "Triglycerides": "A type of fat (lipid) found in your blood. High levels can increase the risk of heart disease and stroke.",

    // Blood Sugar
    "Glucose": "The main type of sugar in the blood and the major source of energy for the body's cells.",
    "HbA1c": "Hemoglobin A1c. Shows your average blood sugar level over the past 2-3 months. Used to diagnose and monitor diabetes.",
    "Insulin": "A hormone that regulates the amount of glucose in the blood.",

    // Kidney Function
    "Creatinine": "A waste product produced by muscles. High levels in the blood can indicate kidney dysfunction.",
    "eGFR": "Estimated Glomerular Filtration Rate. A test that estimates how well your kidneys are filtering waste from your blood.",
    "BUN": "Blood Urea Nitrogen. Measures the amount of nitrogen in your blood that comes from the waste product urea.",

    // Liver Function
    "ALT": "Alanine Aminotransferase. An enzyme found in the liver. High levels can indicate liver damage.",
    "AST": "Aspartate Aminotransferase. An enzyme found in the liver and muscles. High levels can indicate liver or muscle damage.",
    "ALP": "Alkaline Phosphatase. An enzyme related to the liver, bile ducts, and bones.",
    "Bilirubin": "A yellowish substance in your blood. It forms after red blood cells break down. High levels can indicate liver or bile duct issues.",

    // Electrolytes
    "Sodium": "An electrolyte that helps maintain fluid balance and supports nerve and muscle function.",
    "Potassium": "An electrolyte essential for nerve and muscle function, especially the heart.",
    "Chloride": "An electrolyte that helps keep the amount of fluid inside and outside of your cells in balance.",
    "Calcium": "Essential for healthy bones and teeth, as well as proper muscle and nerve function.",

    // Blood Count
    "Hemoglobin": "A protein in red blood cells that carries oxygen to the body's organs and tissues.",
    "Hematocrit": "The proportion of your blood that consists of red blood cells.",
    "WBC": "White Blood Cell count. Measures the number of white blood cells, which help fight infections.",
    "RBC": "Red Blood Cell count. Measures the number of red blood cells, which carry oxygen.",
    "Platelets": "Blood cells that help your blood clot to stop bleeding.",

    // Thyroid
    "TSH": "Thyroid Stimulating Hormone. Controls the production of thyroid hormones.",
    "T4": "Thyroxine. The main hormone produced by the thyroid gland.",
};

export function getDefinition(term: string): string | null {
    if (!term) return null;

    // Direct match
    if (MEDICAL_GLOSSARY[term]) return MEDICAL_GLOSSARY[term];

    // Case-insensitive match & partial matching for common variations
    const lowerTerm = term.toLowerCase();

    // Look for exact keys first (case-insensitive)
    const exactKey = Object.keys(MEDICAL_GLOSSARY).find(k => k.toLowerCase() === lowerTerm);
    if (exactKey) return MEDICAL_GLOSSARY[exactKey];

    // Look for partial matches (e.g., "Serum Creatinine" -> "Creatinine")
    const partialKey = Object.keys(MEDICAL_GLOSSARY).find(k => lowerTerm.includes(k.toLowerCase()));
    if (partialKey) return MEDICAL_GLOSSARY[partialKey];

    return null;
}
