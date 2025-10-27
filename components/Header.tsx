// components/Header.tsx
import React from 'react';
import styles from './Header.module.css';
import { Input } from './ui/Input';
import { Avatar } from './ui/Avatar'; 
import { MicIcon, SearchIcon } from './Icons'; 

// 从父组件接收 props
interface HeaderProps {
  query: string;
  setQuery: (q: string) => void;
  isListening: boolean;
  toggleListening: () => void;
  onGenerate: () => void; 
}

export default function Header({ query, setQuery, isListening, toggleListening, onGenerate }: HeaderProps) {
const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onGenerate();
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <h1 className={styles.title}>Travel AI</h1>
        <div className={styles.searchInputWrapper}>
          <div className={styles.searchInputIcon}>
            <SearchIcon size={18} />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入旅行需求，例如：去日本，5天，预算1万元"
            style={{ paddingLeft: '2.5rem', width: '24rem' }}
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <button
          onClick={toggleListening}
          className={`${styles.micButton} ${isListening ? styles.micButtonListening : ''}`}
        >
          <MicIcon size={16} />
          <span>{isListening ? "停止语音" : "语音输入"}</span>
        </button>
        <Avatar>U</Avatar>
      </div>
    </header>
  );
}