import { getDb } from '../db/connection.js';
import type { CategoryNode } from '../types/index.js';

const CATEGORY_TREE: CategoryNode[] = [
  {
    key: 'basic-elements',
    title: '基础元素',
    children: [
      { key: 'basic-elements|arrows', title: '箭头' },
      { key: 'basic-elements|icons', title: '图标库' },
      { key: 'basic-elements|dividers', title: '分割线&装饰' },
      { key: 'basic-elements|transitions', title: '过渡元素' },
    ],
  },
  {
    key: 'content-containers',
    title: '内容容器',
    children: [
      { key: 'content-containers|text-boxes', title: '文字框' },
      { key: 'content-containers|infographics', title: '信息图框' },
      { key: 'content-containers|data-cards', title: '数据卡片' },
      { key: 'content-containers|quotes-labels', title: '引用框&标签' },
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
      { key: 'structure-templates|pyramid-cycle-matrix', title: '金字塔&循环&矩阵' },
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

  const countMap = new Map<string, number>();
  for (const row of counts) {
    countMap.set(`${row.category}|${row.subcategory}`, row.count);
  }

  return CATEGORY_TREE.map((cat) => ({
    ...cat,
    children: cat.children?.map((child) => ({
      ...child,
      count: countMap.get(child.key) || 0,
    })),
  }));
}
