// The `flow` diagram syntax (specs/06-project-stories.md, "Diagram arsitektur"):
//   one line = one chain of nodes separated by `->`
//   `(text)` = a small note under the node name
//   leading `*` = a highlighted node
//   nodes with the same name on different lines are the same node

export interface FlowNode {
  name: string;
  note?: string;
  highlight: boolean;
}

export interface Flow {
  /** Every node once, in order of first appearance. */
  nodes: FlowNode[];
  /** Each line as the names of its nodes, in order. */
  chains: string[][];
}

const NODE = /^(\*)?\s*([^()]+?)\s*(?:\(([^)]*)\))?$/;

export function parseFlow(text: string): Flow {
  const byName = new Map<string, FlowNode>();
  const chains = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line.split('->').map((raw) => {
        const match = raw.trim().match(NODE);
        if (!match) throw new Error(`Cannot read flow node "${raw.trim()}"`);
        const [, star, name, note] = match;
        const node = byName.get(name) ?? { name, highlight: false };
        if (star) node.highlight = true;
        if (note && !node.note) node.note = note.trim();
        byName.set(name, node);
        return name;
      }),
    );
  return { nodes: [...byName.values()], chains };
}

/** A plain reading of the diagram for screen readers: "A, then B, then C. D, then E." */
export function describeFlow(flow: Flow, then: string): string {
  return flow.chains.map((chain) => chain.join(`, ${then} `) + '.').join(' ');
}

export interface FlowLayout {
  /** Node names per level, top to bottom; within a level in order of first appearance. */
  rows: string[][];
  /** Every arrow once, as [from, to]. */
  edges: [string, string][];
  /** Level of each node. */
  level: Map<string, number>;
}

/**
 * Lays the diagram out top to bottom (specs/06-project-stories.md, Q6.4): a node's level is
 * the longest path to it from a starting node, so every arrow points down. An arrow that
 * would close a loop is ignored for levels but still drawn.
 */
export function layoutFlow(flow: Flow): FlowLayout {
  const edges: [string, string][] = [];
  const seen = new Set<string>();
  for (const chain of flow.chains)
    for (let i = 1; i < chain.length; i++) {
      const key = `${chain[i - 1]}\u0000${chain[i]}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([chain[i - 1], chain[i]]);
      }
    }

  const incoming = new Map<string, string[]>();
  for (const [from, to] of edges) incoming.set(to, [...(incoming.get(to) ?? []), from]);

  const level = new Map<string, number>();
  const visiting = new Set<string>();
  const levelOf = (name: string): number => {
    const known = level.get(name);
    if (known !== undefined) return known;
    if (visiting.has(name)) return -1; // a loop; this arrow does not raise the level
    visiting.add(name);
    const value = Math.max(-1, ...(incoming.get(name) ?? []).map(levelOf)) + 1;
    visiting.delete(name);
    level.set(name, value);
    return value;
  };
  for (const node of flow.nodes) levelOf(node.name);

  const rows: string[][] = [];
  for (const node of flow.nodes) (rows[level.get(node.name)!] ??= []).push(node.name);
  return { rows: rows.filter(Boolean), edges, level };
}
