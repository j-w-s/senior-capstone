import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import DocumentStructure from '../../models/document-structure';
import DocumentTemplate from '../../models/document-template';
import User from '../../models/user';
import { DocumentService } from '../services/document.service';
import { LoginRegisterService } from '../services/login-register.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit,OnDestroy{
  receivedTemplates: DocumentTemplate[] = [];
  workingDocs: any[] = [];
  sentDocs: any[] = [];
  pageIndex = 0;
  selectedDocument!: DocumentStructure;

  userData!: User;

  private destroyed$ = new Subject<void>();

  constructor(private documentService: DocumentService, 
    private loginRegService: LoginRegisterService) {}

  async ngOnInit() {
    //this.templateId = this.route.snapshot.paramMap.get('templateId');
    await this.loginRegService.getUserDataSubject().subscribe(async (user) => {
      // Assign the received groups to the ownedGroups variable
      this.userData = user as User;

      await this.fetchUserTemplatesAndDocs()
      console.log('Receieved Templates: ', this.receivedTemplates)
    }); 

  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  async fetchUserTemplatesAndDocs() {
    
    const receivedTemplatesRefs = this.userData.receivedDocumentTemplates;
    const workingDocsRefs = this.userData.workingOnDocuments;
    const sentDocsRefs = this.userData.submittedDocuments;

    // Fetch the actual document data
    const receivedTemplates = await this.documentService.fetchUserTemplatesAndDocs(receivedTemplatesRefs, "templates");
    const workingDocs = await this.documentService.fetchUserTemplatesAndDocs(workingDocsRefs, "working");
    const sentDocs = await this.documentService.fetchUserTemplatesAndDocs(sentDocsRefs, "submitted");

    // Update your component's properties with the fetched data
    this.receivedTemplates = receivedTemplates;
    this.workingDocs = workingDocs;
    this.sentDocs = sentDocs;
  }

  updatePageIndex(newIndex: number) {
    this.pageIndex = newIndex;
  }

  generateDocumentFromTemplate(selectedTemplate: DocumentTemplate) {
    this.documentService.generateDocumentFromTemplate(selectedTemplate)
  }

  viewDoc(doc: DocumentStructure, pageIndex: number) {
    this.selectedDocument = doc;
    this.updatePageIndex(pageIndex);
  }

  updateDocument(selectedDocument: DocumentStructure) {
    this.documentService.updateDocument(selectedDocument)
    this.updatePageIndex(0)
  }

  submitDocumentToSender(selectedDocument: DocumentStructure) {
    this.documentService.submitDocumentToSender(selectedDocument)
    this.updatePageIndex(0)
  }

}
