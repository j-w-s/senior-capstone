import UserPreferences from './user-preferences';
import UserRating from './user-ratings';
import Animal from './animal';

interface User {
  userId: string;
  userFirstName: string;
  userLastName: string;
  userPhoneNumber: string;
  userEmail: string;
  userDisplayName: string;
  userBiography: string;
  userImage: string;
  userAccountType: number;
  userPreferences: UserPreferences;
  userRatings: UserRating[];
  petsOwned: Animal[];
  petsLost: Animal[];
}
export default User;
