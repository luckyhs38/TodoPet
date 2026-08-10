export const IPC_CHANNELS = {
  setIgnoreMouseEvents: 'window:setIgnoreMouseEvents',
  showPetContextMenu: 'pet:showContextMenu',
  getTodos: 'todo:getAll',
  addTodo: 'todo:add',
  updateTodo: 'todo:update',
  deleteTodo: 'todo:delete',
  todoReminderTriggered: 'todo:reminderTriggered',
} as const;
