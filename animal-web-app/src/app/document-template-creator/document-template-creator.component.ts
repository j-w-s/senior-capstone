import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
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
  userWhoReceivedDocumentTemplate: User[] = [];

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
            this.groupDocumentTemplates = groupDocumentTemplates;
            console.log('Got group document templates')
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
      templateName: [''],
      templateDescription: [''],
      ownerId: [''],
      templateId: [''],
      fields: this.fb.array([]),
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
    this.previousIndex = this.pageIndex;
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
    console.log(this.documentForm.value)
    this.documentService.createNewGroupDocumentTemplate(this.documentForm, this.documentForm.get('ownerId')?.value)
  }

  createNewUserDocumentTemplate() {
    console.log(this.documentForm.value)
    this.documentService.createNewUserDocumentTemplate(this.documentForm)
  }

  viewTemplates(index: number, template: DocumentTemplate) {
    this.userWhoReceivedDocumentTemplate = []
    this.previousIndex = this.pageIndex
    this.pageIndex = index;
    this.selectedDocumentTemplate = template;

    //this.getUserWhoReceivedTemplate()
  }
}