import { getDb } from '../db/connection.js';
import type { CategoryNode } from '../types/index.js';

const CATEGORY_TREE: CategoryNode[] = [
  {
    key: 'basic-elements',
    title: '基础元素',
    children: [
      { key: 'basic-elements|arrows', title: '箭头' },
      { key: 'basic-elements|characters', title: '人物角色' },
      { key: 'basic-elements|business', title: '商务办公' },
      { key: 'basic-elements|tech-digital', title: '科技数字' },
      { key: 'basic-elements|lifestyle', title: '生活场景' },
      { key: 'basic-elements|dividers', title: '分割线&装饰' },
      { key: 'basic-elements|transitions', title: '过渡元素' },
      { key: 'basic-elements|text-boxes', title: '文字框' },
      { key: 'basic-elements|quotes', title: '引用框' },
      { key: 'basic-elements|labels', title: '标签' },
      { key: 'basic-elements|others', title: '其他' },
    ],
  },
  {
    key: 'structure-templates',
    title: '结构模板',
    children: [
      { key: 'structure-templates|side-by-side', title: '并列结构' },
      { key: 'structure-templates|architecture', title: '架构图' },
      { key: 'structure-templates|comparison', title: '对比图' },
      { key: 'structure-templates|flow-timeline', title: '流程图&时间轴' },
      { key: 'structure-templates|pyramid', title: '金字塔' },
      { key: 'structure-templates|cycle', title: '循环' },
      { key: 'structure-templates|matrix', title: '矩阵' },
      { key: 'structure-templates|infographics', title: '信息图' },
    ],
  },
];

export function getCategoryTree(): CategoryNode[] {
  const db = getDb();
  const counts = db.prepare(`
    SELECT category, subcategory, COUNT(*) as count
    FROM components
    GROUP BY category, subcategory
  `).all() as { category: string; subcategory: string; count: number }[];

  return CATEGORY_TREE.map((cat) => ({
    ...cat,
    children: cat.children?.map((child) => {
      let count = 0;
      for (const row of counts) {
        const rowKey = `${row.category}|${row.subcategory}`;
        // 前端导入存英文 key，Python 脚本导入存中文名，两者都匹配
        const chineseKey = `${cat.title}|${child.title}`;
        if (rowKey === child.key || rowKey === chineseKey) {
          count += row.count;
        }
      }
      return { ...child, count };
    }),
  }));
}
