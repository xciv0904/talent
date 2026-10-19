import { createContext, useContext } from 'react';

export const LabActionContext = createContext<(fn: () => void) => boolean>(() => {
  throw new Error('Career Lab 操作需要在實驗室介面中執行。');
});
export const useLabAction = () => useContext(LabActionContext);
