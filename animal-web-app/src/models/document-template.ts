import { DocumentReference } from "@angular/fire/compat/firestore";
import DocumentTemplateFields from "./document-template-fields";

interface DocumentTemplate {
  ownerId: string,
  templateId: string,
  type: string,
  templateName: string,
  templateDescription: string,
  fields: DocumentTemplateFields[]
  sentTemplateToUser: DocumentReference[],
  receievedDocumentFromUser: string[],
}
export default DocumentTemplate;