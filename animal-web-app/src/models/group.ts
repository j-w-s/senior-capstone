import { DocumentReference } from "@angular/fire/firestore";
import BusinessRating from "./business-ratings";
import GroupUser from "./groupUsers";

interface Group {
    groupId: string,
    groupImage: string,
    groupName: string,
    groupDescription: string,
    groupCity: string,
    groupState: string,
  
    groupAddress: string,
    groupBeacons: DocumentReference[],
    groupRating: BusinessRating[],
    groupContactInfo: string,
  
    groupUsers: GroupUser[],
}

export default Group;