interface LostAnimal {
  animalId: string;
  dateLost: Date;
  lastSeenAt: [latitude: number, longitude: number];
  reward: number;
  information: string;
  foundStatus: number;
}
export default LostAnimal;
