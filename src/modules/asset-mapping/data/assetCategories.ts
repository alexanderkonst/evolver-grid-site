// Asset Categories - Third level of the holonic taxonomy
export interface AssetCategory {
    id: string;
    subTypeId: string;
    title: string;
}

export const ASSET_CATEGORIES: AssetCategory[] = [
    // Expertise > Scientific & Technical
    { id: 'professional-science', subTypeId: 'scientific-technical', title: 'Professional' },
    { id: 'life-sciences', subTypeId: 'scientific-technical', title: 'Life Sciences' },
    { id: 'engineering', subTypeId: 'scientific-technical', title: 'Engineering' },
    { id: 'information-technology', subTypeId: 'scientific-technical', title: 'Information Technology' },
    { id: 'mathematics', subTypeId: 'scientific-technical', title: 'Mathematics' },

    // Expertise > Business & Economics
    { id: 'management', subTypeId: 'business-economics', title: 'Management' },
    { id: 'finance', subTypeId: 'business-economics', title: 'Finance' },
    { id: 'marketing', subTypeId: 'business-economics', title: 'Marketing' },
    { id: 'entrepreneurship', subTypeId: 'business-economics', title: 'Entrepreneurship' },
    { id: 'economics', subTypeId: 'business-economics', title: 'Economics' },

    // Expertise > Arts & Humanities
    { id: 'visual-arts', subTypeId: 'arts-humanities', title: 'Visual Arts' },
    { id: 'performing-arts', subTypeId: 'arts-humanities', title: 'Performing Arts' },
    { id: 'literature', subTypeId: 'arts-humanities', title: 'Literature' },
    { id: 'philosophy', subTypeId: 'arts-humanities', title: 'Philosophy' },
    { id: 'history', subTypeId: 'arts-humanities', title: 'History' },

    // Expertise > Social Sciences
    { id: 'psychology', subTypeId: 'social-sciences', title: 'Psychology' },
    { id: 'sociology', subTypeId: 'social-sciences', title: 'Sociology' },
    { id: 'anthropology', subTypeId: 'social-sciences', title: 'Anthropology' },
    { id: 'political-science', subTypeId: 'social-sciences', title: 'Political Science' },
    { id: 'education', subTypeId: 'social-sciences', title: 'Education' },

    // Expertise > Applied Fields
    { id: 'healthcare', subTypeId: 'applied-fields', title: 'Healthcare' },
    { id: 'law', subTypeId: 'applied-fields', title: 'Law' },
    { id: 'environmental-studies', subTypeId: 'applied-fields', title: 'Environmental Studies' },
    { id: 'urban-planning', subTypeId: 'applied-fields', title: 'Urban Planning' },
    { id: 'agriculture', subTypeId: 'applied-fields', title: 'Agriculture' },

    // Life Experiences > Personal Growth
    { id: 'self-discovery', subTypeId: 'personal-growth', title: 'Self-discovery' },
    { id: 'overcoming-challenges', subTypeId: 'personal-growth', title: 'Overcoming Challenges' },
    { id: 'spiritual-journeys', subTypeId: 'personal-growth', title: 'Spiritual Journeys' },
    { id: 'relationships', subTypeId: 'personal-growth', title: 'Relationships' },
    { id: 'health-transformations', subTypeId: 'personal-growth', title: 'Health Transformations' },

    // Life Experiences > Cultural Immersion
    { id: 'long-term-travel', subTypeId: 'cultural-immersion', title: 'Long-term Travel' },
    { id: 'living-abroad', subTypeId: 'cultural-immersion', title: 'Living Abroad' },
    { id: 'language-acquisition', subTypeId: 'cultural-immersion', title: 'Language Acquisition' },
    { id: 'cultural-studies', subTypeId: 'cultural-immersion', title: 'Cultural Studies' },
    { id: 'intercultural-projects', subTypeId: 'cultural-immersion', title: 'Intercultural Projects' },

    // Life Experiences > Humanitarian & Service
    { id: 'volunteering', subTypeId: 'humanitarian-service', title: 'Volunteering' },
    { id: 'social-work', subTypeId: 'humanitarian-service', title: 'Social Work' },
    { id: 'peace-corps', subTypeId: 'humanitarian-service', title: 'Peace Corps' },
    { id: 'disaster-relief', subTypeId: 'humanitarian-service', title: 'Disaster Relief' },
    { id: 'community-building', subTypeId: 'humanitarian-service', title: 'Community Building' },

    // Life Experiences > Nature & Adventure
    { id: 'wilderness-expeditions', subTypeId: 'nature-adventure', title: 'Wilderness Expeditions' },
    { id: 'environmental-conservation', subTypeId: 'nature-adventure', title: 'Environmental Conservation' },
    { id: 'extreme-sports', subTypeId: 'nature-adventure', title: 'Extreme Sports' },
    { id: 'wildlife-interaction', subTypeId: 'nature-adventure', title: 'Wildlife Interaction' },
    { id: 'sustainable-living', subTypeId: 'nature-adventure', title: 'Sustainable Living' },

    // Networks > Professional
    { id: 'industry-associations', subTypeId: 'professional-networks', title: 'Industry Associations' },
    { id: 'alumni-networks', subTypeId: 'professional-networks', title: 'Alumni Networks' },
    { id: 'professional-societies', subTypeId: 'professional-networks', title: 'Professional Societies' },
    { id: 'mentorship-circles', subTypeId: 'professional-networks', title: 'Mentorship Circles' },
    { id: 'entrepreneurial-ecosystems', subTypeId: 'professional-networks', title: 'Entrepreneurial Ecosystems' },

    // Networks > Community
    { id: 'local-organizations', subTypeId: 'community-networks', title: 'Local Organizations' },
    { id: 'volunteer-groups', subTypeId: 'community-networks', title: 'Volunteer Groups' },
    { id: 'spiritual-communities', subTypeId: 'community-networks', title: 'Spiritual Communities' },
    { id: 'hobby-clubs', subTypeId: 'community-networks', title: 'Hobby Clubs' },
    { id: 'neighborhood-associations', subTypeId: 'community-networks', title: 'Neighborhood Associations' },

    // Networks > Industry
    { id: 'trade-groups', subTypeId: 'industry-networks', title: 'Trade Groups' },
    { id: 'research-consortiums', subTypeId: 'industry-networks', title: 'Research Consortiums' },
    { id: 'standards-bodies', subTypeId: 'industry-networks', title: 'Standards Bodies' },
    { id: 'innovation-hubs', subTypeId: 'industry-networks', title: 'Innovation Hubs' },
    { id: 'industry-forums', subTypeId: 'industry-networks', title: 'Industry-Specific Forums' },

    // Networks > Global
    { id: 'international-ngos', subTypeId: 'global-networks', title: 'International NGOs' },
    { id: 'cultural-exchange', subTypeId: 'global-networks', title: 'Cultural Exchange Programs' },
    { id: 'global-think-tanks', subTypeId: 'global-networks', title: 'Global Think Tanks' },
    { id: 'multinational-collaborations', subTypeId: 'global-networks', title: 'Multinational Collaborations' },
    { id: 'diaspora-networks', subTypeId: 'global-networks', title: 'Diaspora Networks' },

    // Material Resources > Financial Capital (NEW)
    { id: 'liquid-savings', subTypeId: 'financial-capital', title: 'Liquid Savings' },
    { id: 'investment-portfolio', subTypeId: 'financial-capital', title: 'Investment Portfolio' },
    { id: 'income-streams', subTypeId: 'financial-capital', title: 'Income Streams' },
    { id: 'credit-access', subTypeId: 'financial-capital', title: 'Credit Access' },

    // Material Resources > Digital Assets (NEW)
    { id: 'domains-websites', subTypeId: 'digital-assets', title: 'Domains & Websites' },
    { id: 'email-lists', subTypeId: 'digital-assets', title: 'Email Lists & Subscribers' },
    { id: 'software-accounts', subTypeId: 'digital-assets', title: 'Software & API Access' },
    { id: 'digital-content', subTypeId: 'digital-assets', title: 'Digital Content Libraries' },

    // Material Resources > Investment Interests
    { id: 'angel-investing', subTypeId: 'investment-interests', title: 'Angel Investing' },
    { id: 'seed-funding', subTypeId: 'investment-interests', title: 'Seed Funding' },
    { id: 'series-funding', subTypeId: 'investment-interests', title: 'Series A-C' },
    { id: 'growth-capital', subTypeId: 'investment-interests', title: 'Growth Capital' },
    { id: 'impact-investing', subTypeId: 'investment-interests', title: 'Impact Investing' },
    { id: 'philanthropy', subTypeId: 'investment-interests', title: 'Philanthropy' },

    // Material Resources > Physical Space
    { id: 'offices', subTypeId: 'physical-space', title: 'Offices' },
    { id: 'workshops', subTypeId: 'physical-space', title: 'Workshops' },
    { id: 'land', subTypeId: 'physical-space', title: 'Land' },
    { id: 'venues', subTypeId: 'physical-space', title: 'Venues' },
    { id: 'retreat-centers', subTypeId: 'physical-space', title: 'Retreat Centers' },

    // Material Resources > Equipment
    { id: 'technology-equipment', subTypeId: 'equipment', title: 'Technology' },
    { id: 'machinery', subTypeId: 'equipment', title: 'Machinery' },
    { id: 'vehicles', subTypeId: 'equipment', title: 'Vehicles' },
    { id: 'scientific-instruments', subTypeId: 'equipment', title: 'Scientific Instruments' },
    { id: 'artistic-tools', subTypeId: 'equipment', title: 'Artistic Tools' },

    // Material Resources > Natural Resources
    { id: 'water-sources', subTypeId: 'natural-resources', title: 'Water Sources' },
    { id: 'energy-resources', subTypeId: 'natural-resources', title: 'Energy Resources' },
    { id: 'agricultural-land', subTypeId: 'natural-resources', title: 'Agricultural Land' },
    { id: 'forests', subTypeId: 'natural-resources', title: 'Forests' },
    { id: 'mineral-deposits', subTypeId: 'natural-resources', title: 'Mineral Deposits' },

    // Intellectual Property > Innovations
    { id: 'patents', subTypeId: 'innovations', title: 'Patents' },
    { id: 'inventions', subTypeId: 'innovations', title: 'Inventions' },
    { id: 'algorithms', subTypeId: 'innovations', title: 'Algorithms' },
    { id: 'prototypes', subTypeId: 'innovations', title: 'Prototypes' },
    { id: 'novel-applications', subTypeId: 'innovations', title: 'Novel Applications' },

    // Intellectual Property > Methodologies
    { id: 'frameworks', subTypeId: 'methodologies', title: 'Frameworks' },
    { id: 'processes', subTypeId: 'methodologies', title: 'Processes' },
    { id: 'systems', subTypeId: 'methodologies', title: 'Systems' },
    { id: 'techniques', subTypeId: 'methodologies', title: 'Techniques' },
    { id: 'approaches', subTypeId: 'methodologies', title: 'Approaches' },

    // Intellectual Property > Creative Works
    { id: 'writing', subTypeId: 'creative-works', title: 'Writing' },
    { id: 'artwork', subTypeId: 'creative-works', title: 'Artwork' },
    { id: 'music', subTypeId: 'creative-works', title: 'Music' },
    { id: 'software', subTypeId: 'creative-works', title: 'Software' },
    { id: 'designs', subTypeId: 'creative-works', title: 'Designs' },

    // Influence > Thought Leadership
    { id: 'publishing', subTypeId: 'thought-leadership', title: 'Publishing' },
    { id: 'speaking', subTypeId: 'thought-leadership', title: 'Speaking' },
    { id: 'consulting', subTypeId: 'thought-leadership', title: 'Consulting' },
    { id: 'mentoring', subTypeId: 'thought-leadership', title: 'Mentoring' },
    { id: 'academic-influence', subTypeId: 'thought-leadership', title: 'Academic Influence' },

    // Influence > Media Reach
    { id: 'social-media', subTypeId: 'media-reach', title: 'Social Media' },
    { id: 'traditional-media', subTypeId: 'media-reach', title: 'Traditional Media' },
    { id: 'podcasts', subTypeId: 'media-reach', title: 'Podcasts' },
    { id: 'blogs', subTypeId: 'media-reach', title: 'Blogs' },
    { id: 'video-platforms', subTypeId: 'media-reach', title: 'Video Platforms' },

    // Influence > Industry Recognition
    { id: 'awards', subTypeId: 'industry-recognition', title: 'Awards' },
    { id: 'board-positions', subTypeId: 'industry-recognition', title: 'Board Positions' },
    { id: 'expert-status', subTypeId: 'industry-recognition', title: 'Expert Status' },
    { id: 'patent-citation', subTypeId: 'industry-recognition', title: 'Patent Citation' },
    { id: 'peer-recognition', subTypeId: 'industry-recognition', title: 'Peer Recognition' },

    // Influence > Community Impact
    { id: 'local-leadership', subTypeId: 'community-impact', title: 'Local Leadership' },
    { id: 'grassroots-organizing', subTypeId: 'community-impact', title: 'Grassroots Organizing' },
    { id: 'policy-influence', subTypeId: 'community-impact', title: 'Policy Influence' },
    { id: 'social-movements', subTypeId: 'community-impact', title: 'Social Movements' },
    { id: 'philanthropy-impact', subTypeId: 'community-impact', title: 'Philanthropy' },

    // Passions & Interests > Creative Pursuits (NEW)
    { id: 'hobbies-crafts', subTypeId: 'creative-pursuits', title: 'Hobbies & Crafts' },
    { id: 'artistic-interests', subTypeId: 'creative-pursuits', title: 'Artistic Interests' },
    { id: 'diy-making', subTypeId: 'creative-pursuits', title: 'DIY & Making' },
    { id: 'design-aesthetics', subTypeId: 'creative-pursuits', title: 'Design & Aesthetics' },

    // Passions & Interests > Physical Activities (NEW)
    { id: 'sports-fitness', subTypeId: 'physical-activities', title: 'Sports & Fitness' },
    { id: 'outdoor-recreation', subTypeId: 'physical-activities', title: 'Outdoor Recreation' },
    { id: 'movement-practices', subTypeId: 'physical-activities', title: 'Movement Practices' },
    { id: 'competitive-sports', subTypeId: 'physical-activities', title: 'Competitive Sports' },

    // Passions & Interests > Intellectual Interests (NEW)
    { id: 'reading-learning', subTypeId: 'intellectual-interests', title: 'Reading & Learning' },
    { id: 'research-inquiry', subTypeId: 'intellectual-interests', title: 'Research & Inquiry' },
    { id: 'puzzles-games', subTypeId: 'intellectual-interests', title: 'Puzzles & Games' },
    { id: 'big-ideas', subTypeId: 'intellectual-interests', title: 'Big Ideas & Theories' },

    // Passions & Interests > Social Causes (NEW)
    { id: 'activism-advocacy', subTypeId: 'social-causes', title: 'Activism & Advocacy' },
    { id: 'environmental-causes', subTypeId: 'social-causes', title: 'Environmental Causes' },
    { id: 'social-justice', subTypeId: 'social-causes', title: 'Social Justice' },
    { id: 'community-service', subTypeId: 'social-causes', title: 'Community Service' },

    // Passions & Interests > Spiritual Practices (NEW)
    { id: 'meditation-mindfulness', subTypeId: 'spiritual-practices', title: 'Meditation & Mindfulness' },
    { id: 'religious-practice', subTypeId: 'spiritual-practices', title: 'Religious Practice' },
    { id: 'contemplative-arts', subTypeId: 'spiritual-practices', title: 'Contemplative Arts' },
    { id: 'healing-modalities', subTypeId: 'spiritual-practices', title: 'Healing Modalities' },
];
