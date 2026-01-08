// Asset Sub-Types - Second level of the holonic taxonomy
import { AssetTypeId } from './assetTypes';

export interface AssetSubType {
    id: string;
    typeId: AssetTypeId;
    title: string;
}

export const ASSET_SUB_TYPES: AssetSubType[] = [
    // Expertise
    { id: 'scientific-technical', typeId: 'expertise', title: 'Scientific & Technical' },
    { id: 'business-economics', typeId: 'expertise', title: 'Business & Economics' },
    { id: 'arts-humanities', typeId: 'expertise', title: 'Arts & Humanities' },
    { id: 'social-sciences', typeId: 'expertise', title: 'Social Sciences' },
    { id: 'applied-fields', typeId: 'expertise', title: 'Applied Fields' },

    // Life Experiences
    { id: 'personal-growth', typeId: 'experiences', title: 'Personal Growth' },
    { id: 'cultural-immersion', typeId: 'experiences', title: 'Cultural Immersion' },
    { id: 'humanitarian-service', typeId: 'experiences', title: 'Humanitarian & Service' },
    { id: 'nature-adventure', typeId: 'experiences', title: 'Nature & Adventure' },

    // Networks
    { id: 'professional-networks', typeId: 'networks', title: 'Professional' },
    { id: 'community-networks', typeId: 'networks', title: 'Community' },
    { id: 'industry-networks', typeId: 'networks', title: 'Industry' },
    { id: 'global-networks', typeId: 'networks', title: 'Global' },

    // Material Resources
    { id: 'financial-capital', typeId: 'resources', title: 'Financial Capital' }, // NEW
    { id: 'digital-assets', typeId: 'resources', title: 'Digital Assets' }, // NEW
    { id: 'investment-interests', typeId: 'resources', title: 'Investment Interests' },
    { id: 'physical-space', typeId: 'resources', title: 'Physical Space' },
    { id: 'equipment', typeId: 'resources', title: 'Equipment' },
    { id: 'natural-resources', typeId: 'resources', title: 'Natural Resources' },

    // Intellectual Property
    { id: 'innovations', typeId: 'ip', title: 'Innovations' },
    { id: 'methodologies', typeId: 'ip', title: 'Methodologies' },
    { id: 'creative-works', typeId: 'ip', title: 'Creative Works' },

    // Influence
    { id: 'thought-leadership', typeId: 'influence', title: 'Thought Leadership' },
    { id: 'media-reach', typeId: 'influence', title: 'Media Reach' },
    { id: 'industry-recognition', typeId: 'influence', title: 'Industry Recognition' },
    { id: 'community-impact', typeId: 'influence', title: 'Community Impact' },
];
