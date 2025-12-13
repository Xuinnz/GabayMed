import { checkSafetyNet } from '../utils/safetyNet.js';
import { runTriagePipeline } from '../services/aiService.js'; // Imported
import { resolveFacilities } from '../services/resolverService.js';

export const handleTriage = async (req, res) => {
  try {
    // 1. Destructure ALL the new fields
    const { symptoms, age, medical_history, medical_background, latitude, longitude } = req.body;

    // STEP 1: SAFETY NET (Zero Latency)
    if (checkSafetyNet(symptoms)) {
      return res.json({
        status: 'EMERGENCY',
        message: 'CRITICAL: Please proceed to the nearest Emergency Room immediately.',
        action: 'CALL_911'
      });
    }

    // STEP 2: AI AGENT (With Profile)
    // Pass the object with age/history
    const diagnosis = await runTriagePipeline(symptoms, { 
        age, 
        medical_history, 
        medical_background 
    });
    
    // STEP 3: GEO-FINANCIAL RESOLVER
    const matrix = await resolveFacilities(
      diagnosis.specialization_slug, 
      latitude, 
      longitude
    );

    // STEP 4: RETURN
    return res.json({
      status: 'SUCCESS',
      diagnosis: diagnosis,
      facilities: matrix
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};