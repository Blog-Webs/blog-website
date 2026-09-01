/**
 * Movement Engine for AI Office Agent Avatars
 * Calculates grid position interpolation, desk targets, meeting room movements, and walking paths.
 */

export const ZONES_LAYOUT = {
  'Manager Office': { x: 82, y: 20, width: 18, height: 22, label: 'Zone 7: Manager Office', color: '#818CF8' },
  'Backend Zone': { x: 35, y: 20, width: 22, height: 25, label: 'Zone 3: Backend', color: '#34D399' },
  'Frontend Zone': { x: 10, y: 20, width: 22, height: 35, label: 'Zone 2: Frontend', color: '#F472B6' },
  'Engineering Zone': { x: 58, y: 20, width: 22, height: 35, label: 'Zone 1: Engineering', color: '#38BDF8' },
  'DevOps Zone': { x: 55, y: 65, width: 22, height: 30, label: 'Zone 5: DevOps', color: '#60A5FA' },
  'QA Zone': { x: 35, y: 65, width: 18, height: 30, label: 'Zone 4: QA', color: '#A78BFA' },
  'Server / Infrastructure Area': { x: 79, y: 65, width: 19, height: 30, label: 'Zone 8: Server & Infra', color: '#FBBF24' },
  'Meeting Room': { x: 79, y: 44, width: 19, height: 18, label: 'Zone 6: Meeting Room', color: '#FB923C' }
};

export function updateAgentPositions(agents, deltaMs = 100) {
  return agents.map((agent) => {
    let targetX = agent.deskX;
    let targetY = agent.deskY;

    // Movement targets based on state
    if (agent.status === 'MEETING') {
      targetX = 85 + (Math.random() * 4 - 2);
      targetY = 50 + (Math.random() * 4 - 2);
    } else if (agent.status === 'COMMUNICATING') {
      targetX = agent.deskX + (Math.random() * 4 - 2);
      targetY = agent.deskY + (Math.random() * 4 - 2);
    } else if (agent.status === 'REVIEWING') {
      targetX = agent.deskX + (Math.random() * 3 - 1.5);
      targetY = agent.deskY + (Math.random() * 3 - 1.5);
    }

    const currentX = agent.x ?? agent.deskX;
    const currentY = agent.y ?? agent.deskY;

    // Interpolate towards target (smooth lerp)
    const speed = 0.08 * (deltaMs / 100);
    const newX = currentX + (targetX - currentX) * speed;
    const newY = currentY + (targetY - currentY) * speed;

    const isMoving = Math.abs(targetX - newX) > 0.5 || Math.abs(targetY - newY) > 0.5;

    return {
      ...agent,
      x: Number(newX.toFixed(2)),
      y: Number(newY.toFixed(2)),
      isMoving
    };
  });
}
