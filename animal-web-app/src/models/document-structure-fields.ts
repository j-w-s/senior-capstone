import { DocumentReference } from "@angular/fire/compat/firestore";

interface DocumentStructureFields {
    name: string,
    value: string | null | number | boolean | any[],
    type: string,
}
export default DocumentStructureFields;
