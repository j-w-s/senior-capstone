import { DocumentReference } from "@angular/fire/compat/firestore";
import DocumentStructureFields from "./document-structure-fields";


interface DocumentStructure{
    generatedFromTemplate: string,
    documentId: string,
    documentName: string,
    documentDescription: string,
    documentSentBy: string,
    type: string,
    documentEditor: string,
    documentSubmitted: boolean,
    fields: DocumentStructureFields[],
    
}
export default DocumentStructure;
