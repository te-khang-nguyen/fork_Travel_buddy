export const globalStore = {
  challengeId: 'default value',
  entity: 'default value',
  field: 'default value',
  role: 'default value',
  setChallengeId: (input: string) => {
      globalStore.challengeId = input;
  },
  setEntity: (input: string) => {
    globalStore.entity = input;
  },
  setField: (input: string) => {
    globalStore.field = input;
  },
  setRole: (input: string) => {
    globalStore.role = input;
  },
};

