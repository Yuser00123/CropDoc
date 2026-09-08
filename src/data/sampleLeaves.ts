import { SampleLeaf } from '../types';
export const SAMPLE_LEAVES: SampleLeaf[] = [
  { id: 'tomato-spots', title: 'Spotted Leaf', subtitle: 'Demo photo — diagnosis not verified', cropName: 'Suspected tomato', sampleType: 'fungal', imageUrl: '/samples/tomato-spotted-leaf.jpg' },
  { id: 'non-plant', title: 'Non-Plant Test', subtitle: 'Synthetic shapes — should be rejected', cropName: 'Not a plant', sampleType: 'pest', imageUrl: '/samples/non-plant.png' },
];
