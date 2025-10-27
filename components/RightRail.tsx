// components/RightRail.tsx
import React, { useState } from 'react';
import styles from './RightRail.module.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
// Dialog component can be created later or mocked
// import { Dialog, DialogTrigger, DialogContent } from './ui/Dialog';

interface RightRailProps {
  plan: any; // 暂时使用 any
}

export default function RightRail({ plan }: RightRailProps) {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  
  if (!plan) return <aside className={styles.rightRail}></aside>;

  return (
    <aside className={styles.rightRail}>
      <div className={styles.railHeader}>
        <div>
          <div className={styles.railTitle}>当前选择</div>
          <div className={styles.railValue}>{plan.days[0].title}</div> {/* 模拟选择第一天 */}
        </div>
        <div>
          <Button variant="outline" onClick={() => alert("导出 PDF（示例）")}>导出</Button>
        </div>
      </div>

      <Card>
        <CardContent style={{ paddingTop: '1rem' }}>
          <div className={styles.railTitle}>行程来自 AI 分析</div>
          <p className="mt-2 text-sm">{plan.generatedFrom || "无"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>费用记录（模拟）</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">已花 ¥0 / 预算 ¥{plan.budget}</p>
          <p className="mt-3 text-xs text-slate-500">旅行中可使用语音录入消费，云端同步。</p>
        </CardContent>
      </Card>
      
      {/* 悬浮 AI 聊天按钮 */}
      <button className={styles.fab} onClick={() => alert("打开AI聊天窗口（示例）")}>💬</button>
    </aside>
  );
}