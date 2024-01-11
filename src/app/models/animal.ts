interface Animal {
  animalId: string;
  owner?: string;
  animalType?: string;
  animalBreed?: string[];
  animalName?: string;
  animalWeight: number;
  animalSex: string;
  temperament: string[];
  about: string;
  images: string[];
  primaryImage: number;
  location: string;
  zipCode: number;
  adoptionStatus: number;
  dateOfBirth?: Date;
  color?: string;
  vaccinationStatus?: string;
}
export default Animal;
