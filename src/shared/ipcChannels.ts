export const IPC_CHANNELS = {
  setIgnoreMouseEvents: 'window:setIgnoreMouseEvents',
  showPetContextMenu: 'pet:showContextMenu',
  getTodos: 'todo:getAll',
  addTodo: 'todo:add',
  updateTodo: 'todo:update',
  deleteTodo: 'todo:delete',
  todoReminderTriggered: 'todo:reminderTriggered',
  getAutoLaunchEnabled: 'settings:getAutoLaunchEnabled',
  setAutoLaunchEnabled: 'settings:setAutoLaunchEnabled',
  getSpeechBubbleSettings: 'settings:getSpeechBubbleSettings',
  setSpeechBubbleEnabled: 'settings:setSpeechBubbleEnabled',
  setSpeechBubbleDurationMinutes: 'settings:setSpeechBubbleDurationMinutes',
} as const;
