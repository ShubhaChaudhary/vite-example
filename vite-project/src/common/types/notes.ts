export interface NotesAwareness {
    email: string;
    name: string;
    avatarUrl?: string;
    playerNumber: number;
  }
  
  export interface NotesText {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    data?: NotesAwareness;
    isCaret?: boolean;
  }
  
  export interface NotesLink {
    type: 'link';
    href: string;
    title?: string;
    children: NotesText[];
  }
  
  export interface NotesCommonBlock {
    id: string;
    momentId?: string;
    momentClientId?: string;
    placeholder?: string;
  }
  
  export interface NotesTextBlock extends NotesCommonBlock {
    type: 'text';
    momentId?: string;
    children: NotesText[];
  }
  
  export interface NotesHeadingBlock extends NotesCommonBlock {
    type: 'heading';
    children: NotesText[];
  }
  
  export interface NotesActionBlock extends NotesCommonBlock {
    type: 'action';
    momentId?: string;
    momentClientId?: string;
    children: NotesText[];
  }
  
  export interface NotesActionsBlock extends NotesCommonBlock {
    type: 'actions';
    children: NotesActionBlock[];
  }
  
  export interface NotesSectionBlock extends NotesCommonBlock {
    type: 'section';
    children: NotesBlock[];
  }
  
  export type NotesBlock =
    | NotesSectionBlock
    | NotesTextBlock
    | NotesHeadingBlock
    | NotesActionBlock
    | NotesActionsBlock;
  
  export type NotesElement = NotesBlock | NotesLink;