'use client';

import { useState, ReactNode } from 'react';
import styles from './Tabs.module.css';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span className={styles.tabLabel}>{tab.label}</span>
            {activeTab === tab.id && <div className={styles.activeIndicator} />}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        {activeTabContent}
      </div>
    </div>
  );
}
