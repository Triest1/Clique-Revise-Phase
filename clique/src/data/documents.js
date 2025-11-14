// Sample document data structure for future integration
export const documents = [
  {
    id: 'clearance',
    name: 'Barangay Clearance',
    description: 'Official clearance for employment, business permits, and other official purposes',
    requirements: [
      'Valid government-issued ID',
      'Proof of residency (utility bills, lease agreement)',
      'Purpose letter stating reason for clearance',
      'Recent 2x2 photo'
    ],
    processingTime: '3-5 business days',
    fee: '₱100.00',
    validity: '6 months',
    category: 'employment'
  },
  {
    id: 'residency',
    name: 'Certificate of Residency',
    description: 'Confirms your address within the barangay for various official purposes',
    requirements: [
      'Valid government-issued ID',
      'Proof of residency (utility bills, lease agreement)',
      'Purpose of certificate',
      'Recent 2x2 photo'
    ],
    processingTime: '2-3 business days',
    fee: '₱75.00',
    validity: '1 year',
    category: 'identification'
  },
  {
    id: 'indigency',
    name: 'Indigency Certificate',
    description: 'Establishes financial need for government programs and services',
    requirements: [
      'Valid government-issued ID',
      'Proof of residency',
      'Income certificate or payslip',
      'Family composition form',
      'Purpose of certificate'
    ],
    processingTime: '5-7 business days',
    fee: '₱50.00',
    validity: '3 months',
    category: 'assistance'
  },
  {
    id: 'community-tax',
    name: 'Community Tax Certificate (Cedula)',
    description: 'Annual community tax certificate required for various transactions',
    requirements: [
      'Valid government-issued ID',
      'Proof of residency',
      'Previous year\'s cedula (if applicable)'
    ],
    processingTime: '1-2 business days',
    fee: '₱25.00',
    validity: '1 year',
    category: 'tax'
  },
  {
    id: 'business-permit',
    name: 'Barangay Business Permit',
    description: 'Required permit for operating businesses within the barangay',
    requirements: [
      'Business registration documents',
      'Valid government-issued ID',
      'Proof of business location',
      'Fire safety certificate',
      'Sanitary permit'
    ],
    processingTime: '7-10 business days',
    fee: '₱200.00',
    validity: '1 year',
    category: 'business'
  },
  {
    id: 'good-moral',
    name: 'Good Moral Character Certificate',
    description: 'Certifies good moral character for employment or education',
    requirements: [
      'Valid government-issued ID',
      'Proof of residency',
      'Purpose of certificate',
      'Recent 2x2 photo'
    ],
    processingTime: '3-5 business days',
    fee: '₱75.00',
    validity: '6 months',
    category: 'character'
  }
];

// Helper functions for document operations
export const getDocumentById = (id) => {
  return documents.find(doc => doc.id === id);
};

export const getDocumentsByCategory = (category) => {
  return documents.filter(doc => doc.category === category);
};

export const searchDocuments = (query) => {
  const lowerQuery = query.toLowerCase();
  return documents.filter(doc => 
    doc.name.toLowerCase().includes(lowerQuery) ||
    doc.description.toLowerCase().includes(lowerQuery) ||
    doc.category.toLowerCase().includes(lowerQuery)
  );
};

// Document categories for filtering
export const documentCategories = [
  { id: 'employment', name: 'Employment', color: 'blue' },
  { id: 'identification', name: 'Identification', color: 'green' },
  { id: 'assistance', name: 'Assistance', color: 'orange' },
  { id: 'tax', name: 'Tax', color: 'purple' },
  { id: 'business', name: 'Business', color: 'indigo' },
  { id: 'character', name: 'Character', color: 'pink' }
];









