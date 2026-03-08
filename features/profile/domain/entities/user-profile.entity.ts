export interface UserProfile {
  displayName: string;
  needsNotes: string; // necessidades específicas (texto livre)
  routinesNotes: string; // rotinas de estudo/trabalho (texto livre)
}

export const defaultUserProfile: UserProfile = {
  displayName: 'Você',
  needsNotes: '',
  routinesNotes: '',
};
