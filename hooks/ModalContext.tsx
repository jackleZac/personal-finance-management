import { createContext, useState, useContext, ReactNode } from 'react';

interface ModalContextType {
  isCreateTransactionVisible: boolean;
  setIsCreateTransactionVisible: (visible: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCreateTransactionVisible, setIsCreateTransactionVisible] = useState(false);

  return (
    <ModalContext.Provider value={{ isCreateTransactionVisible, setIsCreateTransactionVisible }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};