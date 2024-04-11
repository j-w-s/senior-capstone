import { DocumentReference } from "@angular/fire/firestore";
import BusinessRating from "./business-ratings";
import GroupUser from "./groupUsers";

interface Group {
    groupId: string,
    groupImage: string,
    groupName: string,
    groupDescription: string,
    groupCity: string,
  
    groupStreetAddress: string,
    groupPhoneNumber: string,
    groupEmail: string,

    groupBeacons: DocumentReference[],
    groupRating: BusinessRating[],
  
    groupUsers: GroupUser[],
}

export default Group;