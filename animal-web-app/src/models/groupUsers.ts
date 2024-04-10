import { DocumentReference } from '@angular/fire/compat/firestore';

export interface GroupUser {
    userDocRef: DocumentReference,
    addUserPerm: boolean,
    removeUserPerm: boolean,
    updateGroupPerm: boolean,
    deleteGroupPerm: boolean,
    updatePermissionsPerm: boolean,
    isOwner: boolean,
}

export default GroupUser;