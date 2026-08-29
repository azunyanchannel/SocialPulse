import type { AppState, Person, Interaction } from "../models/types";

export const initialPeople: Person[] = [
  {
    id: "person-1",
    name: "陈丹尼 (Daniel Chen)",
    organization: "阳光手工冰淇淋 (Sunny Ice Cream)",
    role: "主理人 & 研发主厨",
    location: "厦门",
    tags: ["客户", "餐饮", "手作匠人"],
    summary: "在厦门港口附近经营一家独立手工冰淇淋工坊，专注于将本土茶饮与时令水果融入风味。",
    importantFacts: [
      "正在筹备秋季新品菜单（主打糖炒栗子与乌龙茶风味）",
      "育有一对上小学阶段的双胞胎女儿",
      "更习惯在上午11点开店前进行沟通或碰面"
    ],
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-28T14:30:00.000Z"
  },
  {
    id: "person-2",
    name: "艾琳娜 (Elena Rostova)",
    organization: "北欧设计实验室 (Nordic Design Lab)",
    role: "首席界面架构师",
    location: "斯德哥尔摩 / 远程",
    tags: ["合作伙伴", "设计", "UI-UX"],
    summary: "与我们团队共同探讨空间界面设计、排版层级和极简视觉体系。",
    importantFacts: [
      "正在撰写一本关于界面微交互的设计书籍",
      "精通瑞典语、英语，并能进行日常德语交流",
      "更喜欢在 Figma 中异步评论交流，尽量减少临时临时电话"
    ],
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-20T16:00:00.000Z"
  },
  {
    id: "person-3",
    name: "马库斯 (Marcus Vance)",
    organization: "顶峰供应链 (Apex Supply Chain)",
    role: "物流统筹主管",
    location: "多伦多",
    tags: ["供应商", "物流"],
    summary: "负责区域仓储调度、货运航线安排与库存进出口合规的核心联络人。",
    importantFacts: [
      "拥有超过12年北美跨境货运与清关经验",
      "马拉松爱好者，正在备战10月的芝加哥马拉松",
      "习惯在每周五下午发送当周的货物追踪汇总简报"
    ],
    createdAt: "2026-08-08T09:30:00.000Z",
    updatedAt: "2026-08-10T11:20:00.000Z"
  }
];

export const initialInteractions: Interaction[] = [
  {
    id: "int-1",
    personId: "person-1",
    occurredAt: "2026-08-28",
    type: "in-person",
    notes: "中午到访冰淇淋店，丹尼分享了正在实验的烘焙乌龙栗子风味样品，并探讨了有机奶源的采购情况。",
    extractedFacts: [
      "秋季新菜单预计于9月中旬正式发布",
      "正在寻找环保冷饮杯包材供应商"
    ],
    createdAt: "2026-08-28T14:30:00.000Z"
  },
  {
    id: "int-2",
    personId: "person-1",
    occurredAt: "2026-08-15",
    type: "message",
    notes: "发送了开店三周年祝贺消息。他表示今年夏季是工坊开业以来客流量最大的一季。",
    extractedFacts: [],
    createdAt: "2026-08-15T09:15:00.000Z"
  },
  {
    id: "int-3",
    personId: "person-2",
    occurredAt: "2026-08-20",
    type: "video-call",
    notes: "进行了30分钟的视频会议，讨论设计规范与排版字号比例，达成共识保持原型界面的高对比度与清晰度。",
    extractedFacts: [
      "将于下周交付配色系统规范文档"
    ],
    createdAt: "2026-08-20T16:00:00.000Z"
  },
  {
    id: "int-4",
    personId: "person-3",
    occurredAt: "2026-08-10",
    type: "phone",
    notes: "电话沟通了第三季度批次的报关清单，马库斯确认所有货运单据已提前完成审核。",
    extractedFacts: [
      "Q3库存货物已顺利通过清关"
    ],
    createdAt: "2026-08-10T11:20:00.000Z"
  }
];

export const initialAppState: AppState = {
  people: initialPeople,
  interactions: initialInteractions
};
