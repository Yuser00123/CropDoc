import { SampleLeaf } from "../types";
import tomatoSpottedLeaf from "../assets/images/tomato_spotted_leaf_1788793197617.jpg";

export const SAMPLE_LEAVES: SampleLeaf[] = [
  {
    id: "tomato-blight",
    title: "Tomato Leaf with Spots",
    subtitle: "Suspected Early Blight (Fungal)",
    cropName: "Tomato (टमाटर)",
    sampleType: "fungal",
    imageUrl: tomatoSpottedLeaf,
  },
  {
    id: "yellow-chlorosis",
    title: "Yellowing Plant Foliage",
    subtitle: "Chlorosis / Nutrient Deficiency",
    cropName: "Sunflower / Garden Plant",
    sampleType: "nutrient",
    imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "leaf-spots-mildew",
    title: "Leaf with Powdery Lesions",
    subtitle: "Mildew / Fungal Infection",
    cropName: "Vegetable / Crop Foliage",
    sampleType: "fungal",
    imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "healthy-crop",
    title: "Healthy Green Leaf",
    subtitle: "Vigorous Green Leaf Tissue",
    cropName: "Healthy Crop (स्वस्थ फसल)",
    sampleType: "healthy",
    imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "non-plant-test",
    title: "Non-Plant Test (Coffee Mug)",
    subtitle: "Test Non-Plant Detection",
    cropName: "Object (Not a leaf)",
    sampleType: "pest",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
  },
];
