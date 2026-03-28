'use client';
import { NodeProps, Node, Handle, Position } from '@xyflow/react';
import { useTreeStore } from '@/store/useTreeStore';

export type CollapsedBubbleData = {
  count: number;
  parentId: string;
  onExpand: (parentId: string) => void;
};

export function CollapsedBubble({ data }: NodeProps<Node<CollapsedBubbleData>>) {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top" className="opacity-0" />
      <div
        onClick={() => data.onExpand(data.parentId)}
        className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border-2 border-dashed border-orange-400 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:scale-110 transition-all shadow-sm"
      >
        <span className="text-orange-500 text-[10px] font-bold">+{data.count}</span>
      </div>
    </>
  );
}