import { DocumentReference } from "@angular/fire/compat/firestore";
import DocumentTemplateFields from "./document-template-fields";

interface t {
  userDocRef: DocumentReference,
  submittedDocRef: DocumentReference,
}

interface DocumentTemplate {
  ownerId: string,
  templateId: string,
  type: string,
  templateName: string,
  templateDescription: string,
  fields: DocumentTemplateFields[]
  sentTemplateToUser: DocumentReference[],
  receivedDocumentFromUser: t[],
}
export default DocumentTemplate;
