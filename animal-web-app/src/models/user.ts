import UserPreferences from './user-preferences';
import UserRating from './user-ratings';
import Animal from './animal';
import { DocumentReference } from '@angular/fire/compat/firestore';

interface User {
  userId: string;
  userFirstName: string;
  userLastName: string;
  userPhoneNumber: string;
  userEmail: string;
  userDisplayName: string;
  userBiography: string;
  userImage: string;
  userAccountType?: number;
  userPreferences: UserPreferences;
  userRatings: UserRating[];
  petsOwned: Animal[];
  petsLost: Animal[];
  ownedGroups: DocumentReference[];
}
export default User;
