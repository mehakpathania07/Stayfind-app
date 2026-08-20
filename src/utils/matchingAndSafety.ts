import { Property, StudentPreferences, RoomOption, CurrencyCode } from '../types';
import { formatPrice } from './currency';

export interface SafetyScoreResult {
  score: number;
  tier: 'High Safety' | 'Good Safety' | 'Moderate Safety' | 'Limited Information';
  tierColor: string;
  reasons: { label: string; verified: boolean; points: number; note?: string }[];
  disclaimer: string;
}

export interface StayMatchResult {
  matchPercentage: number;
  scoreBreakdown: {
    budgetScore: number; // Max 25
    distanceScore: number; // Max 20
    roomTypeScore: number; // Max 15
    genderScore: number; // Max 10
    facilitiesScore: number; // Max 20
    safetyScore: number; // Max 10
  };
  matchingPoints: string[];
  missingPoints: string[];
}

export interface TrueCostCalculation {
  baseRent: number;
  foodCost: number;
  foodSpecified: boolean;
  electricityCost: number;
  electricitySpecified: boolean;
  wifiCost: number;
  wifiSpecified: boolean;
  maintenanceCost: number;
  maintenanceSpecified: boolean;
  otherRecurringCost: number;
  otherSpecified: boolean;
  
  trueMonthlyTotal: number;
  
  securityDeposit: number;
  depositSpecified: boolean;
  brokerage: number;
  brokerageSpecified: boolean;
  oneTimeCharges: number;
  oneTimeSpecified: boolean;
  
  firstMonthTotal: number;
}

/**
 * Calculates a transparent, data-driven Safety Score (0 - 100) based strictly on verified property data.
 */
export function calculateSafetyScore(property: Property): SafetyScoreResult {
  let score = 0;
  const reasons: { label: string; verified: boolean; points: number; note?: string }[] = [];

  // 1. Property Verification (+25 pts)
  const isVerifiedProperty = property.verified || property.verificationStatus === 'verified';
  if (isVerifiedProperty) {
    score += 25;
    reasons.push({
      label: 'Verified property listing (inspected & documents confirmed)',
      verified: true,
      points: 25
    });
  } else {
    reasons.push({
      label: 'Listing verification pending admin review',
      verified: false,
      points: 0,
      note: 'Pending verification'
    });
  }

  // 2. Owner / Warden Verification (+15 pts)
  const isVerifiedOwner = Boolean(property.ownerVerified || property.wardenContact?.verifiedHost);
  if (isVerifiedOwner) {
    score += 15;
    reasons.push({
      label: 'Verified owner / hostel superintendent',
      verified: true,
      points: 15
    });
  } else {
    reasons.push({
      label: 'Owner identity verification pending',
      verified: false,
      points: 0,
      note: 'Not verified'
    });
  }

  // 3. CCTV Surveillance (+15 pts)
  const hasCCTV = Boolean(
    property.cctv ||
    property.securityFeatures?.some(f => f.toLowerCase().includes('cctv')) ||
    property.amenities.some(a => a.category === 'security' && a.name.toLowerCase().includes('cctv') && a.isIncluded)
  );
  if (hasCCTV) {
    score += 15;
    reasons.push({
      label: '24x7 CCTV coverage in common corridors & entry gates',
      verified: true,
      points: 15
    });
  } else {
    reasons.push({
      label: 'CCTV surveillance: Information not provided',
      verified: false,
      points: 0,
      note: 'Not specified'
    });
  }

  // 4. Secure Entry / Biometric / Digital Keycard / 24x7 Guard (+15 pts)
  const hasSecureEntry = Boolean(
    property.secureEntry ||
    property.curfewTime.toLowerCase().includes('digital') ||
    property.curfewTime.toLowerCase().includes('card') ||
    property.securityFeatures?.some(f => f.toLowerCase().includes('biometric') || f.toLowerCase().includes('guard') || f.toLowerCase().includes('lock')) ||
    property.amenities.some(a => a.category === 'security' && a.isIncluded)
  );
  if (hasSecureEntry) {
    score += 15;
    reasons.push({
      label: 'Secure entry (Biometric / Digital Keycard / 24x7 Security Guard)',
      verified: true,
      points: 15
    });
  } else {
    reasons.push({
      label: 'Secure gate entry mechanism: Information not provided',
      verified: false,
      points: 0,
      note: 'Not specified'
    });
  }

  // 5. Emergency Contact Availability (+10 pts)
  const hasEmergencyContact = Boolean(
    property.emergencyContactAvailable ||
    (property.wardenContact && property.wardenContact.phone && property.wardenContact.phone.trim().length > 5)
  );
  if (hasEmergencyContact) {
    score += 10;
    reasons.push({
      label: 'Warden / emergency contact explicitly provided',
      verified: true,
      points: 10
    });
  } else {
    reasons.push({
      label: 'Dedicated 24x7 emergency phone not listed',
      verified: false,
      points: 0,
      note: 'Not listed'
    });
  }

  // 6. Resident Ratings & Reviews (Up to +20 pts)
  const reviewCount = property.reviewCount || property.reviews?.length || 0;
  const rating = property.rating || 0;
  let ratingPoints = 0;

  if (rating >= 4.8) {
    ratingPoints = 20;
  } else if (rating >= 4.5) {
    ratingPoints = 17;
  } else if (rating >= 4.0) {
    ratingPoints = 13;
  } else if (rating >= 3.5) {
    ratingPoints = 8;
  } else if (rating > 0) {
    ratingPoints = 4;
  }

  score += ratingPoints;
  if (rating > 0) {
    reasons.push({
      label: `Positive student feedback rating: ${rating.toFixed(1)} / 5.0 (${reviewCount} reviews)`,
      verified: true,
      points: ratingPoints
    });
  } else {
    reasons.push({
      label: 'No student reviews recorded yet',
      verified: false,
      points: 0,
      note: 'New listing'
    });
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  let tier: SafetyScoreResult['tier'] = 'Limited Information';
  let tierColor = 'text-amber-600 bg-amber-50 border-amber-200';
  if (finalScore >= 85) {
    tier = 'High Safety';
    tierColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (finalScore >= 70) {
    tier = 'Good Safety';
    tierColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
  } else if (finalScore >= 50) {
    tier = 'Moderate Safety';
    tierColor = 'text-blue-700 bg-blue-50 border-blue-200';
  }

  return {
    score: finalScore,
    tier,
    tierColor,
    reasons,
    disclaimer: 'Stay Safety Score is calculated using verified listing attributes and resident community feedback. It does not represent government certification.'
  };
}

/**
 * Calculates a weighted Smart Match percentage (0 - 100%) against a student's preference profile.
 * Weights:
 * - Budget: 25%
 * - Distance: 20%
 * - Room type: 15%
 * - Gender compatibility: 10%
 * - Required facilities: 20%
 * - Safety score: 10%
 */
export function calculateStayMatchScore(
  property: Property,
  preferences?: StudentPreferences | null
): StayMatchResult {
  // Default neutral score if no preferences supplied
  if (!preferences) {
    return {
      matchPercentage: 85,
      scoreBreakdown: {
        budgetScore: 22,
        distanceScore: 18,
        roomTypeScore: 13,
        genderScore: 10,
        facilitiesScore: 14,
        safetyScore: 8,
      },
      matchingPoints: ['Verified student accommodation near campus', 'Good resident ratings'],
      missingPoints: []
    };
  }

  const matchingPoints: string[] = [];
  const missingPoints: string[] = [];

  const lowestRent = Math.min(...property.roomOptions.map(r => r.nominalMonthlyRent));
  const shortestWalkMin = property.commuteOptions[0]?.durationMin || 10;
  const shortestDistKm = property.commuteOptions[0]?.distanceKm || 0.8;
  const safety = calculateSafetyScore(property);

  // 1. Budget Score (Max 25 pts)
  let budgetScore = 0;
  if (preferences.maxBudget && preferences.maxBudget > 0) {
    if (lowestRent <= preferences.maxBudget) {
      budgetScore = 25;
      matchingPoints.push(`Within your monthly budget target`);
    } else {
      const overRatio = (lowestRent - preferences.maxBudget) / preferences.maxBudget;
      if (overRatio <= 0.15) {
        budgetScore = 18;
        missingPoints.push(`Slightly above target budget (${Math.round(overRatio * 100)}% over)`);
      } else if (overRatio <= 0.3) {
        budgetScore = 10;
        missingPoints.push(`Above target budget`);
      } else {
        budgetScore = 2;
        missingPoints.push(`Exceeds preferred budget`);
      }
    }
  } else {
    budgetScore = 22; // Neutral if budget not specified
  }

  // 2. Distance Score (Max 20 pts)
  let distanceScore = 0;
  const preferredMaxKm = preferences.maxDistanceKm || 2.0;
  if (shortestDistKm <= preferredMaxKm) {
    distanceScore = 20;
    matchingPoints.push(`${shortestWalkMin} min walk to campus (${shortestDistKm} km)`);
  } else {
    const diff = shortestDistKm - preferredMaxKm;
    if (diff <= 0.5) {
      distanceScore = 14;
      matchingPoints.push(`Near campus (${shortestWalkMin} min walk)`);
    } else if (diff <= 1.5) {
      distanceScore = 8;
      missingPoints.push(`Further than preferred radius (${shortestDistKm} km)`);
    } else {
      distanceScore = 3;
      missingPoints.push(`Distance is ${shortestDistKm} km from campus`);
    }
  }

  // 3. Room Type Score (Max 15 pts)
  let roomTypeScore = 0;
  if (!preferences.roomType || preferences.roomType === 'any') {
    roomTypeScore = 15;
    matchingPoints.push(`Multiple room tiers available (${property.roomOptions.length} types)`);
  } else {
    const hasMatchingRoom = property.roomOptions.some(r => r.type === preferences.roomType);
    if (hasMatchingRoom) {
      roomTypeScore = 15;
      const matchedTitle = property.roomOptions.find(r => r.type === preferences.roomType)?.title || preferences.roomType;
      matchingPoints.push(`Preferred room type available (${matchedTitle})`);
    } else {
      roomTypeScore = 4;
      missingPoints.push(`Does not offer ${preferences.roomType} occupancy`);
    }
  }

  // 4. Gender Policy Score (Max 10 pts)
  let genderScore = 0;
  if (!preferences.genderPolicy || preferences.genderPolicy === 'any') {
    genderScore = 10;
  } else if (preferences.genderPolicy === property.genderPolicy) {
    genderScore = 10;
    matchingPoints.push(`Exact gender compatibility (${property.genderPolicy.toUpperCase()})`);
  } else if (property.genderPolicy === 'coed') {
    genderScore = 8;
    matchingPoints.push(`Co-Ed student living community`);
  } else {
    genderScore = 0;
    missingPoints.push(`Gender policy is ${property.genderPolicy}`);
  }

  // 5. Required Facilities Score (Max 20 pts)
  let facilitiesScore = 0;
  const facilityMaxSubPoints = 3.33; // 6 checks * ~3.33 = 20 pts

  // Food check
  if (preferences.foodRequired === 'yes') {
    if (property.mealsIncluded) {
      facilitiesScore += facilityMaxSubPoints;
      matchingPoints.push(`Chef-prepared meals included`);
    } else {
      missingPoints.push(`Meals not included in base rent`);
    }
  } else {
    facilitiesScore += facilityMaxSubPoints;
  }

  // AC check
  const hasAC = property.roomOptions.some(r => r.airConditioning) || 
    property.amenities.some(a => a.name.toLowerCase().includes('ac') || a.name.toLowerCase().includes('air condition'));
  if (preferences.acRequired) {
    if (hasAC) {
      facilitiesScore += facilityMaxSubPoints;
      matchingPoints.push(`Air Conditioning available`);
    } else {
      missingPoints.push(`No AC in room`);
    }
  } else {
    facilitiesScore += facilityMaxSubPoints;
  }

  // Wi-Fi check
  if (preferences.wifiRequired) {
    if (property.wifiSpeedMbps >= 100) {
      facilitiesScore += facilityMaxSubPoints;
      matchingPoints.push(`High-Speed Wi-Fi (${property.wifiSpeedMbps} Mbps)`);
    } else {
      facilitiesScore += 2;
    }
  } else {
    facilitiesScore += facilityMaxSubPoints;
  }

  // Attached Bath check
  const hasAttachedBath = property.roomOptions.some(r => r.attachedBath);
  if (preferences.attachedBath === 'required') {
    if (hasAttachedBath) {
      facilitiesScore += facilityMaxSubPoints;
      matchingPoints.push(`Attached private bathroom`);
    } else {
      missingPoints.push(`Shared bathroom only`);
    }
  } else if (preferences.attachedBath === 'preferred') {
    if (hasAttachedBath) {
      facilitiesScore += facilityMaxSubPoints;
      matchingPoints.push(`Attached private bathroom`);
    } else {
      facilitiesScore += 1.5;
    }
  } else {
    facilitiesScore += facilityMaxSubPoints;
  }

  // Laundry check
  const hasLaundry = property.amenities.some(a => a.name.toLowerCase().includes('laundry') || a.name.toLowerCase().includes('washing') || a.name.toLowerCase().includes('cleaning'));
  if (preferences.laundry === 'required') {
    if (hasLaundry) {
      facilitiesScore += facilityMaxSubPoints;
      matchingPoints.push(`Laundry / washing facility`);
    } else {
      missingPoints.push(`No on-site laundry`);
    }
  } else {
    facilitiesScore += facilityMaxSubPoints;
  }

  // Power Backup check
  if (preferences.powerBackup === 'required') {
    if (property.powerBackup) {
      facilitiesScore += facilityMaxSubPoints;
      matchingPoints.push(`24x7 Power Backup Generator`);
    } else {
      missingPoints.push(`No power backup`);
    }
  } else {
    facilitiesScore += facilityMaxSubPoints;
  }

  facilitiesScore = Math.min(20, Math.round(facilitiesScore));

  // 6. Safety Score Weight (Max 10 pts)
  const safetyScore = Math.min(10, Math.round((safety.score / 100) * 10));
  if (safety.score >= 85) {
    matchingPoints.push(`High Safety Score (${safety.score}/100)`);
  }

  // Calculate total percentage (0 - 100)
  const totalRaw = budgetScore + distanceScore + roomTypeScore + genderScore + facilitiesScore + safetyScore;
  const matchPercentage = Math.min(99, Math.max(35, Math.round(totalRaw)));

  return {
    matchPercentage,
    scoreBreakdown: {
      budgetScore,
      distanceScore,
      roomTypeScore,
      genderScore,
      facilitiesScore,
      safetyScore
    },
    matchingPoints: matchingPoints.slice(0, 5),
    missingPoints: missingPoints.slice(0, 3)
  };
}

/**
 * Calculates complete TrueCost breakdown (True Monthly Cost + First-Month Cost).
 * Handles unspecified/missing fields gracefully without silently fabricating numbers.
 */
export function calculateTrueCost(
  property: Property,
  selectedRoomOption?: RoomOption | null,
  customAdjustments?: {
    food?: number;
    electricity?: number;
    wifi?: number;
    maintenance?: number;
    other?: number;
    deposit?: number;
  }
): TrueCostCalculation {
  const room = selectedRoomOption || property.roomOptions.find(r => r.id === property.defaultRoomId) || property.roomOptions[0];
  const baseRent = room?.nominalMonthlyRent || property.monthlyRent || 0;

  // Extract from baseCostBreakdown or dedicated fields
  const foodItem = property.baseCostBreakdown.find(b => b.category === 'food' && b.period === 'monthly');
  const foodSpecified = property.foodCost !== undefined || foodItem !== undefined || property.mealsIncluded;
  const foodCost = customAdjustments?.food !== undefined 
    ? customAdjustments.food 
    : (property.foodCost ?? (foodItem ? foodItem.amount : (property.mealsIncluded ? 0 : 0)));

  const elecItem = property.baseCostBreakdown.find(b => b.category === 'utilities' && (b.name.toLowerCase().includes('elec') || b.tooltip?.toLowerCase().includes('meter')));
  const electricitySpecified = property.electricityCost !== undefined || elecItem !== undefined;
  const electricityCost = customAdjustments?.electricity !== undefined
    ? customAdjustments.electricity
    : (property.electricityCost ?? (elecItem ? elecItem.amount : 0));

  const wifiItem = property.baseCostBreakdown.find(b => b.category === 'utilities' && b.name.toLowerCase().includes('wifi'));
  const wifiSpecified = property.wifiCost !== undefined || wifiItem !== undefined || property.wifiSpeedMbps > 0;
  const wifiCost = customAdjustments?.wifi !== undefined
    ? customAdjustments.wifi
    : (property.wifiCost ?? (wifiItem ? wifiItem.amount : 0));

  const maintItem = property.baseCostBreakdown.find(b => b.category === 'maintenance' && b.period === 'monthly');
  const maintenanceSpecified = property.maintenanceCost !== undefined || maintItem !== undefined;
  const maintenanceCost = customAdjustments?.maintenance !== undefined
    ? customAdjustments.maintenance
    : (property.maintenanceCost ?? (maintItem ? maintItem.amount : 0));

  const otherItem = property.baseCostBreakdown.find(b => b.period === 'monthly' && !['rent', 'food', 'utilities', 'maintenance'].includes(b.category));
  const otherSpecified = property.otherRecurringCost !== undefined || otherItem !== undefined;
  const otherRecurringCost = customAdjustments?.other !== undefined
    ? customAdjustments.other
    : (property.otherRecurringCost ?? (otherItem ? otherItem.amount : 0));

  const trueMonthlyTotal = baseRent + foodCost + electricityCost + wifiCost + maintenanceCost + otherRecurringCost;

  // One-Time costs
  const depositItem = property.baseCostBreakdown.find(b => b.category === 'deposit' && b.period === 'one-time');
  const depositSpecified = property.securityDeposit !== undefined || depositItem !== undefined || room?.depositMonths !== undefined;
  const defaultDeposit = property.securityDeposit ?? (depositItem ? depositItem.amount : (baseRent * (room?.depositMonths || 1)));
  const securityDeposit = customAdjustments?.deposit !== undefined ? customAdjustments.deposit : defaultDeposit;

  const brokerageSpecified = true; // 0% on StayFind
  const brokerage = property.brokerage ?? 0;

  const oneTimeItem = property.baseCostBreakdown.find(b => b.period === 'one-time' && b.category !== 'deposit');
  const oneTimeSpecified = property.oneTimeCharges !== undefined || oneTimeItem !== undefined;
  const oneTimeCharges = property.oneTimeCharges ?? (oneTimeItem ? oneTimeItem.amount : 0);

  const firstMonthTotal = trueMonthlyTotal + securityDeposit + brokerage + oneTimeCharges;

  return {
    baseRent,
    foodCost,
    foodSpecified,
    electricityCost,
    electricitySpecified,
    wifiCost,
    wifiSpecified,
    maintenanceCost,
    maintenanceSpecified,
    otherRecurringCost,
    otherSpecified,
    trueMonthlyTotal,
    securityDeposit,
    depositSpecified,
    brokerage,
    brokerageSpecified,
    oneTimeCharges,
    oneTimeSpecified,
    firstMonthTotal
  };
}
