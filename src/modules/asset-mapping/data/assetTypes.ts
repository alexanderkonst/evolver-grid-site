// Asset Types - Top level of the holonic taxonomy (6 types)
export type AssetTypeId = 'expertise' | 'experiences' | 'networks' | 'resources' | 'ip' | 'influence';

export interface AssetType {
    id: AssetTypeId;
    title: string;
    description: string;
    icon: string; // emoji for simple rendering
}

export const ASSET_TYPES: AssetType[] = [
    {
        id: 'expertise',
        title: 'Expertise',
        description: 'Professional skills and knowledge you\'ve mastered',
        icon: '🎓'
    },
    {
        id: 'experiences',
        title: 'Life Experiences',
        description: 'Significant experiences that shaped who you are',
        icon: '🌍'
    },
    {
        id: 'networks',
        title: 'Networks',
        description: 'Communities, organizations, and people you\'re connected to',
        icon: '🤝'
    },
    {
        id: 'resources',
        title: 'Material Resources',
        description: 'Physical, digital, or financial resources you have access to',
        icon: '💰'
    },
    {
        id: 'ip',
        title: 'Intellectual Property',
        description: 'Frameworks, content, methodologies, or creative works you\'ve developed',
        icon: '💡'
    },
    {
        id: 'influence',
        title: 'Influence',
        description: 'Platforms, recognition, or credibility you\'ve built',
        icon: '📢'
    }
];
