import { useMemo } from "react";
import SkillNode from "./SkillNode";
import type { SkillTree as SkillTreeType, SkillNode as SkillNodeType } from "@/data/skillTrees";

interface SkillTreeProps {
    tree: SkillTreeType;
    progress?: Record<string, "locked" | "available" | "in_progress" | "completed">;
    onNodeClick?: (node: SkillNodeType) => void;
}

const SkillTree = ({ tree, progress = {}, onNodeClick }: SkillTreeProps) => {
    // Calculate node status based on prerequisites and progress
    const nodeStatuses = useMemo(() => {
        const statuses: Record<string, "locked" | "available" | "in_progress" | "completed"> = {};

        tree.nodes.forEach((node) => {
            // If we have explicit progress for this node, use it
            if (progress[node.id]) {
                statuses[node.id] = progress[node.id];
                return;
            }

            // Otherwise, calculate based on prerequisites
            if (node.prerequisites.length === 0) {
                statuses[node.id] = "available";
            } else {
                const allPrereqsCompleted = node.prerequisites.every(
                    (prereqId) => progress[prereqId] === "completed"
                );
                statuses[node.id] = allPrereqsCompleted ? "available" : "locked";
            }
        });

        return statuses;
    }, [tree.nodes, progress]);

    // Generate connection lines between nodes
    const connections = useMemo(() => {
        const lines: { from: SkillNodeType; to: SkillNodeType }[] = [];

        tree.nodes.forEach((node) => {
            node.prerequisites.forEach((prereqId) => {
                const prereqNode = tree.nodes.find((n) => n.id === prereqId);
                if (prereqNode) {
                    lines.push({ from: prereqNode, to: node });
                }
            });
        });

        return lines;
    }, [tree.nodes]);

    return (
        <div className="relative w-full h-full min-h-[500px]">
            {/* Background gradient */}
            <div
                className={`absolute inset-0 bg-gradient-to-t ${tree.bgGradient} rounded-xl`}
            />

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <linearGradient id={`line-gradient-${tree.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={tree.color} stopOpacity="0.3" />
                        <stop offset="50%" stopColor={tree.color} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={tree.color} stopOpacity="0.3" />
                    </linearGradient>
                </defs>
                {connections.map(({ from, to }, index) => {
                    const fromStatus = nodeStatuses[from.id];
                    const toStatus = nodeStatuses[to.id];
                    const isActive = fromStatus === "completed" || toStatus !== "locked";

                    return (
                        <line
                            key={`${from.id}-${to.id}-${index}`}
                            x1={`${from.position.x}%`}
                            y1={`${from.position.y}%`}
                            x2={`${to.position.x}%`}
                            y2={`${to.position.y}%`}
                            stroke={isActive ? tree.color : "#333"}
                            strokeWidth={isActive ? 2 : 1}
                            strokeOpacity={isActive ? 0.5 : 0.2}
                            strokeDasharray={isActive ? "none" : "4 4"}
                        />
                    );
                })}
            </svg>

            {/* Nodes */}
            {tree.nodes.map((node) => (
                <SkillNode
                    key={node.id}
                    node={node}
                    status={nodeStatuses[node.id]}
                    color={tree.color}
                    onClick={() => onNodeClick?.(node)}
                />
            ))}

        </div>
    );
};

export default SkillTree;
