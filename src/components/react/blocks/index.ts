/**
 * Block Component Registry
 *
 * Maps each block type to its edit-mode component and default props factory.
 * Adding a new block type = add 1 entry here → Open/Closed Principle.
 *
 * Clean Code: every block follows the same interface:
 * - BlockComponent(props) → React element
 * - createDefaultProps() → props object with sensible defaults
 */

import type { Block, BlockType } from '@/lib/blocks';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import VideoBlock from './VideoBlock';
import ContainerBlock from './ContainerBlock';
import ColumnsBlock from './ColumnsBlock';
import SpacerBlock from './SpacerBlock';
import DividerBlock from './DividerBlock';
import HeroBlock from './HeroBlock';
import CTABlock from './CTABlock';
import CodeBlock from './CodeBlock';
import AccordionBlock from './AccordionBlock';
import TabsBlock from './TabsBlock';
import FormBlock from './FormBlock';
import MapBlock from './MapBlock';
import TestimonialBlock from './TestimonialBlock';
import IconBoxBlock from './IconBoxBlock';
import QueryLoopBlock from './QueryLoopBlock';

// ============================================================================
// BLOCK COMPONENT INTERFACE
// ============================================================================

export interface BlockComponentProps {
  block: Block;
  onUpdate: (updates: Record<string, unknown>) => void;
  children?: React.ReactNode;
}

type BlockComponentType = React.FC<BlockComponentProps>;

// ============================================================================
// REGISTRY
// ============================================================================

interface BlockRegistryEntry {
  component: BlockComponentType;
  createDefaultProps: () => Record<string, unknown>;
}

export const blockRegistry: Record<BlockType, BlockRegistryEntry> = {
  text: {
    component: TextBlock,
    createDefaultProps: () => ({ content: '', tag: 'p' }),
  },
  image: {
    component: ImageBlock,
    createDefaultProps: () => ({ src: '', alt: '', caption: '' }),
  },
  video: {
    component: VideoBlock,
    createDefaultProps: () => ({ url: '', aspectRatio: '16/9' }),
  },
  container: {
    component: ContainerBlock,
    createDefaultProps: () => ({ layout: 'flex-col' }),
  },
  columns: {
    component: ColumnsBlock,
    createDefaultProps: () => ({ columnCount: '2', gap: 16 }),
  },
  spacer: {
    component: SpacerBlock,
    createDefaultProps: () => ({ height: 40 }),
  },
  divider: {
    component: DividerBlock,
    createDefaultProps: () => ({ style: 'solid', color: '#E2E8F0' }),
  },
  hero: {
    component: HeroBlock,
    createDefaultProps: () => ({ title: 'Hero Title', subtitle: '', backgroundImage: '', ctaText: '', ctaUrl: '' }),
  },
  cta: {
    component: CTABlock,
    createDefaultProps: () => ({ text: 'Click Me', url: '#', variant: 'primary' }),
  },
  code: {
    component: CodeBlock,
    createDefaultProps: () => ({ code: '', language: 'javascript' }),
  },
  accordion: {
    component: AccordionBlock,
    createDefaultProps: () => ({ title: 'Accordion', defaultOpen: false }),
  },
  tabs: {
    component: TabsBlock,
    createDefaultProps: () => ({ tabLabels: 'Tab 1,Tab 2' }),
  },
  form: {
    component: FormBlock,
    createDefaultProps: () => ({ formTitle: 'ติดต่อเรา', submitText: 'ส่ง' }),
  },
  map: {
    component: MapBlock,
    createDefaultProps: () => ({ embedUrl: '', height: 400 }),
  },
  testimonial: {
    component: TestimonialBlock,
    createDefaultProps: () => ({ quote: '', author: '', role: '' }),
  },
  'icon-box': {
    component: IconBoxBlock,
    createDefaultProps: () => ({ icon: '⭐', title: '', description: '' }),
  },
  'query-loop': {
    component: QueryLoopBlock,
    createDefaultProps: () => ({ entityType: 'pages', limit: 6 }),
  },
};

// ============================================================================
// CREATE BLOCK HELPER (used by sidebar to add new blocks)
// ============================================================================

export function createBlock(type: BlockType): Block {
  const entry = blockRegistry[type];
  return {
    id: crypto.randomUUID(),
    type,
    props: entry.createDefaultProps(),
    styles: {},
    visibility: { desktop: true, tablet: true, mobile: true },
    children: ['container', 'columns', 'accordion', 'tabs'].includes(type) ? [] : undefined,
  } as Block;
}
