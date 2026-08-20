// Utility helpers and high quality realistic accommodation imagery for StayFind
import type { SyntheticEvent } from 'react';
import { Property, RoomOption } from '../types';

export interface AccommodationImage {
  url: string;
  label: string;
  category: 'single' | 'double' | 'triple' | 'study' | 'bathroom' | 'common' | 'kitchen' | 'exterior' | 'studio' | 'hostel';
  description?: string;
}

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80';
export const NEUTRAL_PLACEHOLDER = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80';

export const ACCOMMODATION_IMAGE_CATALOG: Record<string, AccommodationImage[]> = {
  single: [
    {
      url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      label: 'Single Private Bedroom',
      category: 'single',
      description: 'Private student bedroom with comfortable bed, study desk, and storage'
    },
    {
      url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      label: 'Cozy Private Room',
      category: 'single',
      description: 'Bright private room with wood finish and natural daylight'
    },
    {
      url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef2?auto=format&fit=crop&w=1200&q=80',
      label: 'Private Study Room',
      category: 'single',
      description: 'Dedicated single room with bookshelf and study corner'
    }
  ],
  double: [
    {
      url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      label: 'Double-Sharing Bedroom',
      category: 'double',
      description: 'Twin sharing bedroom with individual beds, personal wardrobes and bedside tables'
    },
    {
      url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      label: 'Twin Sharing Room',
      category: 'double',
      description: 'Clean, well-ventilated twin sharing student room'
    },
    {
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      label: 'Spacious 2-Bed Sharing',
      category: 'double',
      description: 'Modern 2-bed sharing setup with individual reading lights'
    }
  ],
  triple: [
    {
      url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      label: 'Triple-Sharing Bedroom',
      category: 'triple',
      description: 'Budget-friendly 3-bed student room with ample storage and lockers'
    },
    {
      url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      label: '3-Bed Sharing Room',
      category: 'triple',
      description: 'Organized triple occupancy student bedroom with individual study spaces'
    }
  ],
  study: [
    {
      url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      label: 'Study Desk & Workspace',
      category: 'study',
      description: 'Ergonomic study desk with lamp, power sockets, and bookshelf'
    },
    {
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      label: 'Dedicated Quiet Study Area',
      category: 'study',
      description: 'Bright workspace designed for productive exam prep and coding'
    }
  ],
  bathroom: [
    {
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      label: 'Attached Bathroom',
      category: 'bathroom',
      description: 'Clean private attached washroom with modern fixtures, mirror, and geyser'
    },
    {
      url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
      label: 'Modern Washroom & Geyser',
      category: 'bathroom',
      description: 'Well-maintained bathroom with 24x7 hot water geyser'
    }
  ],
  common: [
    {
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      label: 'Student Lounge & Common Area',
      category: 'common',
      description: 'Comfortable common lounge for socializing, reading, and group discussions'
    },
    {
      url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
      label: 'Recreation & Common Space',
      category: 'common',
      description: 'Shared student zone with sofa seating and high-speed Wi-Fi'
    }
  ],
  kitchen: [
    {
      url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      label: 'Dining Area & Mess Hall',
      category: 'kitchen',
      description: 'Clean dining tables for daily nutritious breakfast, lunch, and dinner'
    },
    {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      label: 'Student Kitchenette / Pantry',
      category: 'kitchen',
      description: 'Equipped student pantry with microwave, induction, and RO drinking water'
    }
  ],
  exterior: [
    {
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      label: 'Building Exterior & Gate',
      category: 'exterior',
      description: 'Well-maintained building entrance with security gate and CCTV'
    },
    {
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      label: 'Campus Residence Facade',
      category: 'exterior',
      description: 'Secure student housing property near university campus'
    },
    {
      url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
      label: 'Residential PG Villa',
      category: 'exterior',
      description: 'Peaceful residential neighborhood close to campus'
    }
  ],
  studio: [
    {
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      label: 'Student Studio Apartment',
      category: 'studio',
      description: 'Independent studio room with private bed, kitchenette and work desk'
    },
    {
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      label: 'Modern Student Flat',
      category: 'studio',
      description: 'Bright open-plan student living space'
    }
  ],
  hostel: [
    {
      url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      label: 'PG / Hostel Common Space',
      category: 'hostel',
      description: 'Organized hostel wing with clean corridors and security access'
    }
  ]
};

/**
 * Returns a suitable image corresponding to a room type, attached washroom, or food option
 */
export function getRoomTypeImage(
  roomType: 'single' | 'double' | 'triple' | 'quad' | 'other' | string,
  attachedBath: boolean = false,
  foodIncluded: boolean = false
): string {
  if (roomType === 'single') {
    return ACCOMMODATION_IMAGE_CATALOG.single[0].url;
  }
  if (roomType === 'double') {
    return ACCOMMODATION_IMAGE_CATALOG.double[0].url;
  }
  if (roomType === 'triple' || roomType === 'quad') {
    return ACCOMMODATION_IMAGE_CATALOG.triple[0].url;
  }
  if (attachedBath) {
    return ACCOMMODATION_IMAGE_CATALOG.bathroom[0].url;
  }
  if (foodIncluded) {
    return ACCOMMODATION_IMAGE_CATALOG.kitchen[0].url;
  }
  return FALLBACK_IMAGE;
}

/**
 * Builds a structured, categorized gallery for a property with proper labels and realistic accommodation images
 */
export function buildPropertyGallery(property: Property): AccommodationImage[] {
  // If property already has galleryImages with custom URLs that aren't empty, use them with sensible labels
  const result: AccommodationImage[] = [];

  // Determine main primary room types available in this property
  const hasSingle = property.roomOptions.some(r => r.type === 'single');
  const hasDouble = property.roomOptions.some(r => r.type === 'double');
  const hasTriple = property.roomOptions.some(r => r.type === 'triple' || r.type === 'quad');
  const hasAttachedBath = property.roomOptions.some(r => r.attachedBath) || property.amenities.some(a => a.name.toLowerCase().includes('washroom') || a.name.toLowerCase().includes('bath'));
  const hasMeals = property.mealsIncluded || property.foodAvailable || property.foodCost > 0;

  // Add primary cover/exterior
  if (property.coverImage) {
    result.push({
      url: property.coverImage,
      label: 'Exterior & Facade',
      category: 'exterior',
      description: 'Building entrance, surroundings and exterior'
    });
  }

  // Room type images based on availability
  if (hasSingle) {
    result.push(ACCOMMODATION_IMAGE_CATALOG.single[0]);
  }
  if (hasDouble) {
    result.push(ACCOMMODATION_IMAGE_CATALOG.double[0]);
  }
  if (hasTriple) {
    result.push(ACCOMMODATION_IMAGE_CATALOG.triple[0]);
  }

  // Study workspace
  result.push(ACCOMMODATION_IMAGE_CATALOG.study[0]);

  // Bathroom
  if (hasAttachedBath) {
    result.push(ACCOMMODATION_IMAGE_CATALOG.bathroom[0]);
  }

  // Dining & Mess
  if (hasMeals) {
    result.push(ACCOMMODATION_IMAGE_CATALOG.kitchen[0]);
  }

  // Common lounge
  result.push(ACCOMMODATION_IMAGE_CATALOG.common[0]);

  // Include any extra images from property.galleryImages if not already included
  if (property.galleryImages && property.galleryImages.length > 0) {
    property.galleryImages.forEach((imgUrl, idx) => {
      if (!result.some(item => item.url === imgUrl)) {
        result.push({
          url: imgUrl,
          label: `Property View ${idx + 1}`,
          category: 'hostel',
          description: 'Verified accommodation space'
        });
      }
    });
  }

  return result;
}

/**
 * Handle image fallback safely when an image fails to load
 */
export function handleImageError(e: SyntheticEvent<HTMLImageElement, Event>, fallback: string = FALLBACK_IMAGE) {
  const target = e.currentTarget;
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
