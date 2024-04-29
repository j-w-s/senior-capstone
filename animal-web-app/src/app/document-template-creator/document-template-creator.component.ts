import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import DocumentStructure from '../../models/document-structure';
import DocumentTemplate from '../../models/document-template';
import Group from '../../models/group';
import User from '../../models/user';
import { DocumentService } from '../services/document.service';
import { LoginRegisterService } from '../services/login-register.service';

@Component({
  selector: 'app-document-template-creator',
  templateUrl: './document-template-creator.component.html',
  styleUrl: './document-template-creator.component.scss'
})
export class DocumentTemplateCreatorComponent implements OnInit,OnDestroy{

  public ownedGroups: Group[] = [];
  groupDocumentTemplates: DocumentTemplate[] = [];
  userDocumentTemplates: DocumentTemplate[] = [];
  
  pageIndex = 0;
  previousIndex = 0;

  selectedDocumentTemplate: DocumentTemplate | null = null;
  selectedDocument: DocumentStructure | null = null;
  usersWhoReceivedDocumentTemplate: User[] = [];
  usersWhoSubmittedDocuments: string[] = ['s']

  documentForm!: FormGroup;
  documentFieldsForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private loginRegService: LoginRegisterService,
    private documentService: DocumentService,
    private fb: FormBuilder,
  ) {}

  async ngOnInit() {
    await this.loginRegService.userOwnedGroupsSubject.subscribe(async groups => {
      // Assign the received groups to the ownedGroups variable
      this.ownedGroups = groups;
      console.log('User Owned Groups: ', this.ownedGroups);

      this.ownedGroups.forEach(async group => {
        // Get the document templates for each group
        this.documentService.getGroupDocumentTemplates(group.groupId).then(async (observable$: Observable<DocumentTemplate[]>) => {
          await observable$.pipe(takeUntil(this.destroy$)).subscribe(async (groupDocumentTemplates: DocumentTemplate[]) => {
            console.log('The returned group templates: ', groupDocumentTemplates)

            const filteredGroups = this.groupDocumentTemplates.filter((template) => template.ownerId != groupDocumentTemplates[0].ownerId)

            this.groupDocumentTemplates = [...filteredGroups, ...groupDocumentTemplates];

            console.log('Got group document templates')
            console.log(this.groupDocumentTemplates)
          });
        });
      });

      this.documentService.getUserDocumentTemplates().then(async (observable$: Observable<DocumentTemplate[]>) => {
        await observable$.pipe(takeUntil(this.destroy$)).subscribe(async (userDocumentTemplates: DocumentTemplate[]) => {
          this.userDocumentTemplates = userDocumentTemplates;
          console.log('Got user document templates')
        }); 
      });
    });

    this.documentForm = this.fb.group({
      ownerId: [''],
      templateId: [''],
      templateName: [''],
      templateDescription: [''],
      fields: this.fb.array([]),
      sentTemplateToUser: [],
      receivedDocumentFromUser: [],
    });
    this.documentFieldsForm = this.fb.group({
      name: [''],
      type: ['']
     });
  }

  // Gets rid of the listeners when the page is destroyed (refreshed, unloaded, etc.)
  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  updatePageIndex(newIndex: number) {
    if(this.pageIndex != 4) {
      this.previousIndex = this.pageIndex;
    }
    this.pageIndex = newIndex;
    console.log('Update index:', this.pageIndex)
  }

  get fields() {
    return this.documentForm.get('fields') as FormArray;
  }

  addNewField() {
    const newField = this.documentFieldsForm.value;
    this.fields.push(this.fb.group(newField));
    this.documentFieldsForm.reset();
  }

  removeField(index: number) {
    this.fields.removeAt(index);
  }

  createNewGroupDocumentTemplate() {
    //console.log(this.documentForm.value)
    this.documentService.createNewGroupDocumentTemplate(this.documentForm, this.documentForm.get('ownerId')?.value)
    this.documentFieldsForm = this.fb.group({
      name: [''],
      type: ['']
     });
     
    this.documentForm = this.fb.group({
      ownerId: [''],
      templateId: [''],
      templateName: [''],
      templateDescription: [''],
      fields: this.fb.array([]),
      sentTemplateToUser: [],
      receivedDocumentFromUser: [],
    });
  }

  createNewUserDocumentTemplate() {
    console.log(this.documentForm.value)
    this.documentService.createNewUserDocumentTemplate(this.documentForm)
    this.documentFieldsForm = this.fb.group({
      name: [''],
      type: ['']
     });

    this.documentForm = this.fb.group({
      ownerId: [''],
      templateId: [''],
      templateName: [''],
      templateDescription: [''],
      fields: this.fb.array([]),
      sentTemplateToUser: [],
      receivedDocumentFromUser: [],
    });
  }

  viewTemplates(index: number, template: DocumentTemplate) {
    this.usersWhoReceivedDocumentTemplate = []
    this.previousIndex = this.pageIndex
    this.pageIndex = index;
    this.selectedDocumentTemplate = template;

    this.getUserWhoReceivedTemplate()
    this.getUserWhoSentDocument()
  }

  sendTemplates() {
    // Retrieve the usernames from the input field
    const usernamesInput = document.getElementById('usernames') as HTMLInputElement;
    const usernames = usernamesInput.value.split(',').map(username => username.trim());
   
    // Send out document template to all usernames provided
    usernames.forEach(username => {
       console.log(`Sending template to: ${username}`);
       // Your sending logic here
       this.documentService.sendDocumentTemplateToUser(username, this.selectedDocumentTemplate as DocumentTemplate)
    });
  }

  getUserWhoReceivedTemplate() {
    if(this.selectedDocumentTemplate && this.selectedDocumentTemplate.sentTemplateToUser != null)
    this.selectedDocumentTemplate.sentTemplateToUser.forEach(async docRef => {
      await this.documentService.getUserWhoReceivedTemplate(docRef).then((userData) => {
        this.usersWhoReceivedDocumentTemplate.push(userData)
      })
    })
  }

  getUserWhoSentDocument() {
    this.usersWhoSubmittedDocuments = []
    if(this.selectedDocumentTemplate?.receivedDocumentFromUser)
    {
      console.log('Doc from User: ', this.selectedDocumentTemplate?.receivedDocumentFromUser)
      this.selectedDocumentTemplate?.receivedDocumentFromUser.forEach(docRef => {
        this.usersWhoSubmittedDocuments.push(docRef.userDocRef.path.split('/')[1])
      })
    }
  }

  viewSubmittedDocument(userId: string) {
    this.selectedDocumentTemplate?.receivedDocumentFromUser.forEach(async map => {
      if(map.userDocRef.path.split('/')[1] == userId) {
        await this.documentService.getSubmittedDocument(map.submittedDocRef).then(doc => {
          this.selectedDocument = doc;
        });
      }
    })

    this.updatePageIndex(4)
  }

  
}
